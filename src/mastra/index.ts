import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { traigeAgent } from './agents/triage-agent';

export const mastra = new Mastra({
  agents: { traigeAgent },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
