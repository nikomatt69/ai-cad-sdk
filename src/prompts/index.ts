import { promptTemplates } from './templates';

/**
 * Manages prompt templates and provides utilities for customizing prompts
 */
export class PromptManager {
  private templates: typeof promptTemplates;
  private customTemplates: Record<string, Record<string, string>> = {};

  constructor(templates = promptTemplates) {
    this.templates = templates;
  }

  /**
   * Get a prompt template by category and type
   */
  getTemplate(category: keyof typeof promptTemplates, type = 'system'): string {
    // Check for custom template first
    if (
      this.customTemplates[category as string] &&
      this.customTemplates[category as string][type]
    ) {
      return this.customTemplates[category as string][type];
    }

    // Fall back to built-in template
    return (
      this.templates[category][
        type as keyof (typeof this.templates)[typeof category]
      ] || ''
    );
  }

  /**
   * Add or update a custom template
   */
  setCustomTemplate(category: string, type: string, template: string): void {
    if (!this.customTemplates[category]) {
      this.customTemplates[category] = {};
    }

    this.customTemplates[category][type] = template;
  }

  /**
   * Remove a custom template
   */
  removeCustomTemplate(category: string, type: string): boolean {
    if (
      this.customTemplates[category] &&
      this.customTemplates[category][type]
    ) {
      delete this.customTemplates[category][type];
      return true;
    }

    return false;
  }

  /**
   * Fill in placeholders in a template
   */
  fillTemplate(template: string, replacements: Record<string, string>): string {
    let filledTemplate = template;

    Object.entries(replacements).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      filledTemplate = filledTemplate.replace(placeholder, value);
    });

    return filledTemplate;
  }

  /**
   * Get a filled template with replacements
   */
  getFilledTemplate(
    category: keyof typeof promptTemplates,
    type = 'system',
    replacements: Record<string, string> = {}
  ): string {
    const template = this.getTemplate(category, type);
    return this.fillTemplate(template, replacements);
  }

  /**
   * Get all available template categories
   */
  getCategories(): string[] {
    return Object.keys(this.templates);
  }

  /**
   * Get all available template types for a category
   */
  getTemplateTypes(category: keyof typeof promptTemplates): string[] {
    return Object.keys(this.templates[category]);
  }

  /**
   * Merge custom templates with built-in templates
   */
  getAllTemplates(): Record<string, Record<string, string>> {
    const allTemplates: Record<string, Record<string, string>> = {};

    // Add built-in templates
    Object.entries(this.templates).forEach(([category, typeMap]) => {
      allTemplates[category] = {};

      Object.entries(typeMap).forEach(([type, template]) => {
        allTemplates[category][type] = template;
      });
    });

    // Override with custom templates
    Object.entries(this.customTemplates).forEach(([category, typeMap]) => {
      if (!allTemplates[category]) {
        allTemplates[category] = {};
      }

      Object.entries(typeMap).forEach(([type, template]) => {
        allTemplates[category][type] = template;
      });
    });

    return allTemplates;
  }
}

// Export singleton instance
export const promptManager = new PromptManager();

// Export prompt templates
export { promptTemplates };
