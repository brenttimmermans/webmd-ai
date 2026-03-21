import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { weatherWorkflow } from "./workflows/weather-workflow";
import { triageWorkflow } from "./workflows/triage-workflow";
import { weatherAgent } from "./agents/weather-agent";
import { traigeAgent } from "./agents/triage-agent";

export const mastra = new Mastra({
  workflows: { weatherWorkflow, triageWorkflow },
  agents: { weatherAgent, traigeAgent },
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});
