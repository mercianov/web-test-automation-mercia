import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';
import * as https from 'https';

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  failedTests: { title: string; project: string; error: string }[];
}

interface GroupSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

class SlackReporter implements Reporter {
  private summary: TestSummary = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
    failedTests: [],
  };

  private tagSummaries: Map<string, GroupSummary> = new Map();
  private startTime = Date.now();
  private token = process.env.SLACK_BOT_TOKEN ?? '';
  private channelId = process.env.SLACK_CHANNEL_ID ?? '';

  // CircleCI built-in env vars (auto-injected, no need to set manually)
  private buildUrl = process.env.CIRCLE_BUILD_URL ?? '';
  private buildNum = process.env.CIRCLE_BUILD_NUM ?? '';

  private getReportUrl(): string {
    if (!this.buildNum) return '';
    // CircleCI artifact URL pattern
    return `https://output.circle-artifacts.com/output/job/${this.buildNum}/artifacts/0/playwright-report/index.html`;
  }

  private extractTags(title: string): string[] {
    return title.match(/@\w+/g) ?? [];
  }

  onBegin(_config: FullConfig, _suite: Suite): void {
    this.startTime = Date.now();
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.summary.total++;

    const tags = this.extractTags(test.title);
    const projectName = test.parent.project()?.name ?? 'unknown';

    if (result.status === 'passed') {
      this.summary.passed++;
    } else if (result.status === 'failed' || result.status === 'timedOut') {
      this.summary.failed++;
      this.summary.failedTests.push({
        title: test.title,
        project: projectName,
        error: result.error?.message?.split('\n')[0] ?? 'Unknown error',
      });
    } else if (result.status === 'skipped') {
      this.summary.skipped++;
    }

    // Per-tag breakdown (e.g. @smoke, @regression)
    for (const tag of tags) {
      if (!this.tagSummaries.has(tag)) {
        this.tagSummaries.set(tag, { total: 0, passed: 0, failed: 0, skipped: 0 });
      }
      const tagSum = this.tagSummaries.get(tag)!;
      tagSum.total++;
      if (result.status === 'passed') tagSum.passed++;
      else if (result.status === 'failed' || result.status === 'timedOut') tagSum.failed++;
      else if (result.status === 'skipped') tagSum.skipped++;
    }
  }

  async onEnd(result: FullResult): Promise<void> {
    this.summary.duration = Date.now() - this.startTime;

    if (!this.token || !this.channelId) {
      console.log('[SlackReporter] SLACK_BOT_TOKEN or SLACK_CHANNEL_ID not set — skipping Slack notification.');
      return;
    }

    const message = this.buildMessage(result.status);
    await this.sendSlackMessage(message);
  }

  private buildMessage(overallStatus: FullResult['status']): object {
    const { total, passed, failed, skipped, duration, failedTests } = this.summary;
    const durationStr = this.formatDuration(duration);
    const statusEmoji = overallStatus === 'passed' ? ':white_check_mark:' : ':x:';
    const statusText = overallStatus === 'passed' ? 'PASSED' : 'FAILED';

    const reportUrl = this.getReportUrl();
    const links = [
      this.buildUrl ? `<${this.buildUrl}|View CI Build>` : '',
      reportUrl ? `<${reportUrl}|View Playwright Report>` : '',
    ].filter(Boolean).join('  |  ');

    const blocks: object[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${statusEmoji} Sauce Demo Automation Results: ${statusText}`,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Total Tests:* ${total}` },
          { type: 'mrkdwn', text: `*Duration:* ${durationStr}` },
          { type: 'mrkdwn', text: `:white_check_mark: *Passed:* ${passed}` },
          { type: 'mrkdwn', text: `:x: *Failed:* ${failed}` },
          { type: 'mrkdwn', text: `:fast_forward: *Skipped:* ${skipped}` },
        ],
      },
    ];

    // Per-tag breakdown (@smoke / @regression)
    if (this.tagSummaries.size > 0) {
      const tagLines = [...this.tagSummaries.entries()]
        .map(([tag, s]) => {
          const tagEmoji = s.failed > 0 ? ':x:' : ':white_check_mark:';
          return `${tagEmoji} *${tag}* — Total: ${s.total} | Passed: ${s.passed} | Failed: ${s.failed} | Skipped: ${s.skipped}`;
        })
        .join('\n');

      blocks.push({ type: 'divider' });
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*Results by Tag:*\n${tagLines}` },
      });
    }

    // Failed test details
    if (failedTests.length > 0) {
      const failList = failedTests
        .slice(0, 10)
        .map(f => `• *[${f.project}]* ${f.title}\n  \`${f.error}\``)
        .join('\n');
      const failedSection = failedTests.length > 10
        ? `${failList}\n_...and ${failedTests.length - 10} more_`
        : failList;

      blocks.push({ type: 'divider' });
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*Failed Tests:*\n${failedSection}` },
      });
    }

    // Links
    if (links) {
      blocks.push({ type: 'divider' });
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `:link: ${links}` },
      });
    }

    blocks.push({ type: 'divider' });

    return {
      channel: this.channelId,
      text: `${statusEmoji} Sauce Demo Automation: ${statusText}`,
      blocks,
    };
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  }

  private async sendSlackMessage(body: object): Promise<void> {
    return new Promise((resolve) => {
      const payload = JSON.stringify(body);
      const options: https.RequestOptions = {
        hostname: 'slack.com',
        path: '/api/chat.postMessage',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${this.token}`,
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const req = https.request(options, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.ok) {
              console.log('[SlackReporter] Notification sent to Slack.');
            } else {
              console.error('[SlackReporter] Slack API error:', parsed.error);
            }
          } catch {
            console.error('[SlackReporter] Failed to parse Slack response');
          }
          resolve();
        });
      });

      req.on('error', err => {
        console.error('[SlackReporter] Request failed:', err.message);
        resolve();
      });

      req.write(payload);
      req.end();
    });
  }
}

export default SlackReporter;
