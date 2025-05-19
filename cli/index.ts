#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import {
  aiCADCore,
  mcpService,
  mcpConfigManager,
  TextToCADRequest,
  DesignAnalysisRequest,
  AIModelType,
} from '../src';
import fs from 'fs';
import path from 'path';

const program = new Command();

// Setup version and description
program
  .name('ai-cad-cli')
  .description('Command line interface for AI CAD SDK')
  .version('1.0.0');

// Initialize SDK
const initializeSDK = async (apiKey?: string) => {
  let key = apiKey;

  if (!key) {
    try {
      // Try to load from config file
      const configPath = path.join(
        process.env.HOME || process.env.USERPROFILE || '',
        '.ai-cad-config.json'
      );
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        key = config.apiKey;
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  }

  if (!key) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter your API key:',
        validate: (input) => (input.length > 0 ? true : 'API key is required'),
      },
    ]);

    key = answers.apiKey;

    // Save to config file
    try {
      const configPath = path.join(
        process.env.HOME || process.env.USERPROFILE || '',
        '.ai-cad-config.json'
      );
      fs.writeFileSync(configPath, JSON.stringify({ apiKey: key }), 'utf-8');
      console.log(chalk.green('API key saved to config file'));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  // Initialize SDK
  aiCADCore.configure({
    apiKey: key,
    defaultModel: 'claude-3-7-sonnet-20250219',
    mcpEnabled: true,
    mcpStrategy: 'balanced',
  });

  return aiCADCore.initialize();
};

// Command: Text to CAD
program
  .command('text-to-cad')
  .description('Convert text description to CAD elements')
  .option('-d, --description <text>', 'Text description of the CAD model')
  .option(
    '-s, --style <style>',
    'Style (precise, artistic, mechanical, organic)',
    'precise'
  )
  .option(
    '-c, --complexity <complexity>',
    'Complexity (simple, moderate, complex)',
    'moderate'
  )
  .option('-o, --output <file>', 'Output file for elements (JSON)')
  .option('-k, --api-key <key>', 'API key (optional if saved in config)')
  .action(async (options) => {
    try {
      if (!options.description) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'description',
            message: 'Enter a description of the CAD model:',
            validate: (input) =>
              input.length > 0 ? true : 'Description is required',
          },
          {
            type: 'list',
            name: 'style',
            message: 'Select style:',
            choices: ['precise', 'artistic', 'mechanical', 'organic'],
            default: options.style || 'precise',
          },
          {
            type: 'list',
            name: 'complexity',
            message: 'Select complexity:',
            choices: ['simple', 'moderate', 'complex'],
            default: options.complexity || 'moderate',
          },
          {
            type: 'input',
            name: 'output',
            message: 'Output file (optional):',
            default: options.output || '',
          },
        ]);

        Object.assign(options, answers);
      }

      // Initialize SDK
      await initializeSDK(options.apiKey);

      const spinner = ora('Converting text to CAD elements...').start();

      const request: TextToCADRequest = {
        description: options.description,
        style: options.style as any,
        complexity: options.complexity as any,
        useMCP: true,
      };

      const aiService = aiCADCore.getAIService();
      const response = await aiService.textToCAD(request);

      spinner.stop();

      if (response.success) {
        console.log(
          chalk.green(`✅ Generated ${response?.data?.length} CAD elements`)
        );

        if (options.output) {
          fs.writeFileSync(
            options.output,
            JSON.stringify(response.data, null, 2),
            'utf-8'
          );
          console.log(chalk.blue(`📄 Elements saved to ${options.output}`));
        } else {
          console.log(chalk.yellow('Elements:'));
          console.log(JSON.stringify(response.data, null, 2));
        }
      } else {
        console.error(chalk.red(`❌ Error: ${response.error}`));
        process.exit(1);
      }
    } catch (error: any) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

// Command: Analyze Design
program
  .command('analyze-design')
  .description('Analyze CAD design for improvements')
  .option('-i, --input <file>', 'Input JSON file with CAD elements')
  .option(
    '-t, --type <type>',
    'Analysis type (structural, manufacturability, cost, performance, comprehensive)',
    'comprehensive'
  )
  .option('-m, --material <material>', 'Material context (optional)')
  .option('-o, --output <file>', 'Output file for analysis results (JSON)')
  .option('-k, --api-key <key>', 'API key (optional if saved in config)')
  .action(async (options) => {
    try {
      if (!options.input) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'input',
            message: 'Enter path to CAD elements JSON file:',
            validate: (input) =>
              input.length > 0 ? true : 'Input file is required',
          },
          {
            type: 'list',
            name: 'type',
            message: 'Select analysis type:',
            choices: [
              'structural',
              'manufacturability',
              'cost',
              'performance',
              'comprehensive',
            ],
            default: options.type || 'comprehensive',
          },
          {
            type: 'input',
            name: 'material',
            message: 'Material context (optional):',
            default: options.material || '',
          },
          {
            type: 'input',
            name: 'output',
            message: 'Output file (optional):',
            default: options.output || '',
          },
        ]);

        Object.assign(options, answers);
      }

      // Initialize SDK
      await initializeSDK(options.apiKey);

      // Read input file
      const elements = JSON.parse(fs.readFileSync(options.input, 'utf-8'));

      const spinner = ora('Analyzing design...').start();

      const request: DesignAnalysisRequest = {
        elements,
        analysisType: options.type as any,
        materialContext: options.material,
        useMCP: true,
      };

      const aiService = aiCADCore.getAIService();
      const response = await aiService.analyzeDesign(request);

      spinner.stop();

      if (response.success) {
        console.log(chalk.green('✅ Design analysis complete'));

        if (options.output) {
          fs.writeFileSync(
            options.output,
            JSON.stringify(response.data, null, 2),
            'utf-8'
          );
          console.log(chalk.blue(`📄 Analysis saved to ${options.output}`));
        } else {
          console.log(chalk.yellow('Analysis results:'));
          console.log(JSON.stringify(response.data, null, 2));
        }
      } else {
        console.error(chalk.red(`❌ Error: ${response.error}`));
        process.exit(1);
      }
    } catch (error: any) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

// Command: MCP Configuration
program
  .command('mcp-config')
  .description('Configure MCP settings')
  .option(
    '-s, --strategy <strategy>',
    'MCP strategy (aggressive, balanced, conservative)'
  )
  .option(
    '-m, --multi-provider <enabled>',
    'Enable multi-provider support (true/false)'
  )
  .option(
    '-p, --preferred-provider <provider>',
    'Set preferred provider (CLAUDE, OPENAI)'
  )
  .option('-k, --api-key <key>', 'API key (optional if saved in config)')
  .action(async (options) => {
    try {
      // Initialize SDK
      await initializeSDK(options.apiKey);

      // Show current config if no options provided
      if (
        !options.strategy &&
        options.multiProvider === undefined &&
        !options.preferredProvider
      ) {
        const currentStrategy = mcpConfigManager.getMCPParams();
        const isMultiProviderEnabled =
          mcpConfigManager.isMultiProviderEnabled();
        const preferredProvider = mcpConfigManager.getPreferredProvider();

        console.log(chalk.blue('Current MCP Configuration:'));
        console.log(
          `Strategy: ${chalk.green(
            mcpConfigManager.isEnabled() ? 'enabled' : 'disabled'
          )}`
        );
        console.log(
          `Current strategy: ${chalk.green(currentStrategy.cacheStrategy)}`
        );
        console.log(`Cache TTL: ${chalk.green(currentStrategy.cacheTTL)} ms`);
        console.log(
          `Min similarity: ${chalk.green(currentStrategy.minSimilarity)}`
        );
        console.log(`Priority: ${chalk.green(currentStrategy.priority)}`);
        console.log(
          `Multi-provider: ${chalk.green(
            isMultiProviderEnabled ? 'enabled' : 'disabled'
          )}`
        );
        console.log(
          `Preferred provider: ${chalk.green(preferredProvider || 'none')}`
        );

        // Prompt for changes
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'strategy',
            message: 'Select MCP strategy:',
            choices: ['aggressive', 'balanced', 'conservative'],
            default: 'balanced',
          },
          {
            type: 'confirm',
            name: 'multiProvider',
            message: 'Enable multi-provider support?',
            default: isMultiProviderEnabled,
          },
          {
            type: 'list',
            name: 'preferredProvider',
            message: 'Set preferred provider:',
            choices: ['CLAUDE', 'OPENAI', 'none'],
            default: preferredProvider || 'none',
            when: (answers) => answers.multiProvider,
          },
        ]);

        options.strategy = answers.strategy;
        options.multiProvider = answers.multiProvider;
        options.preferredProvider =
          answers.preferredProvider === 'none'
            ? undefined
            : answers.preferredProvider;
      }

      // Apply settings
      if (options.strategy) {
        mcpConfigManager.setStrategy(options.strategy as any);
        console.log(chalk.green(`Strategy set to: ${options.strategy}`));
      }

      if (options.multiProvider !== undefined) {
        const enabled =
          options.multiProvider === 'true' || options.multiProvider === true;
        mcpConfigManager.setMultiProviderEnabled(enabled);
        console.log(
          chalk.green(
            `Multi-provider support: ${enabled ? 'enabled' : 'disabled'}`
          )
        );
      }

      if (options.preferredProvider) {
        mcpConfigManager.setPreferredProvider(options.preferredProvider as any);
        console.log(
          chalk.green(`Preferred provider set to: ${options.preferredProvider}`)
        );
      }

      console.log(chalk.blue('MCP configuration updated!'));
    } catch (error: any) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

// Command: Test Connection
program
  .command('test')
  .description('Test SDK connection and configuration')
  .option('-k, --api-key <key>', 'API key (optional if saved in config)')
  .action(async (options) => {
    try {
      // Initialize SDK
      await initializeSDK(options.apiKey);

      const spinner = ora('Testing connection...').start();

      const aiService = aiCADCore.getAIService();

      const testRequest = {
        prompt: 'Briefly explain what AI-CAD is in one sentence.',
        model: 'claude-3-7-sonnet-20250219' as AIModelType,
        maxTokens: 50,
        temperature: 0.3,
        useMCP: true,
      };

      const response = await aiService.processRequest(testRequest);

      spinner.stop();

      if (response.success) {
        console.log(chalk.green('✅ Connection successful!'));
        console.log(chalk.blue('Response:'));
        console.log(response.data);

        // Show some stats
        const stats = await mcpService.getStats();
        console.log(chalk.yellow('\nMCP Stats:'));
        console.log(`Active requests: ${stats.activeRequests}`);
        console.log(`Cache entries: ${stats.exactCache.totalItems}`);

        console.log(chalk.yellow('\nSDK Configuration:'));
        console.log(`MCP enabled: ${aiCADCore.getConfig().mcpEnabled}`);
        console.log(`Default model: ${aiCADCore.getConfig().defaultModel}`);
      } else {
        console.error(chalk.red(`❌ Connection failed: ${response.error}`));
        process.exit(1);
      }
    } catch (error: any) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

// Execute the program
program.parse(process.argv);

// If no arguments provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
