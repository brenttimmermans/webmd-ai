import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { traigeAgent } from './agents/triage-agent';
import { weatherAgent } from './agents/weather-agent';
import { weatherWorkflow } from './workflows/weather-workflow';

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { weatherAgent, traigeAgent },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
