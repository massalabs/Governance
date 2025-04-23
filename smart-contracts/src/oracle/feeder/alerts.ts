import axios from 'axios';

const EVENT_EXPIRATION_TIME = 1000 * 60 * 1; // 1 minute
const alertInstance = 'governance';

export class AlertsService {
  private enabled = false;
  private webHookUrl: string | undefined;
  private massaNetwork = 'Unknown';

  constructor() {
    this.enabled = process.env.ALERTS_ENABLED === 'true';
    if (this.enabled) {
      console.log('Alerts enabled');
      this.webHookUrl = process.env.ALERTS_WEBHOOK_URL;
      if (!this.webHookUrl) {
        console.error('Alerts enabled but no webhook url provided');
      }
    }
  }

  public setNetwork(network: string) {
    this.massaNetwork = network;
  }

  public async triggerAlert(
    alertname: string,
    summary: string,
    severity: 'warning' | 'critical' = 'warning',
    isOneTimeEvent = false,
  ): Promise<void> {
    console.log(`Triggering alert ${alertname}. Message: ${summary}`);

    if (!this.enabled) {
      return;
    }


    const alertData = [
      {
        status: 'firing',
        labels: {
          alertname,
          severity,
          instance: alertInstance,
          dimension_Network: this.massaNetwork,
        },
        annotations: {
          summary,
        },
      },
    ];
    if (isOneTimeEvent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (alertData[0] as any).endsAt = new Date(Date.now() + EVENT_EXPIRATION_TIME).toISOString();
    }

    const alerts = await this.getAlerts();
    if (alerts.includes(alertData[0].labels.alertname)) {
      console.log(`Alert ${alertData[0].labels.alertname} already exists`);
      return;
    }

    await this.postAlert(alertData);
  }

  public async closeAlert(alert: string): Promise<void> {
    const alertData = [
      {
        status: 'resolved',
        labels: {
          alertname: alert,
        },
      },
    ];
    await this.postAlert(alertData);
  }

  public async resolveAlerts(): Promise<void> {
    const alerts = await this.getAlerts();
    if (alerts.length === 0) return;

    for (const alert of alerts) {
      await this.closeAlert(alert);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async postAlert(data: any): Promise<void> {
    if (this.webHookUrl) {
      // Check for existing alerts to prevent duplicates
      const activeAlerts = await this.getAlerts();
      if (activeAlerts.includes(data[0].labels.alertname)) {
        return;
      }

      try {
        await axios.post(this.webHookUrl, data);
      } catch (e) {
        console.warn('Error posting alert:', e);
      }
    }
  }

  public async getAlerts(): Promise<string[]> {
    if (this.webHookUrl) {
      try {
        const response = await axios.get(this.webHookUrl);
        return response.data.data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((item: any) => item.labels.instance === alertInstance && item.status.state === 'active')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => item.labels.alertname);
      } catch (e) {
        console.warn('Error getting alerts:', e);
        return [];
      }
    }
    return [];
  }
} 