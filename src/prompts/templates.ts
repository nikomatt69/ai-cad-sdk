/**
 * Prompt templates for various AI tasks in the CAD/CAM domain
 */

/**
 * Templates for converting text to CAD elements
 */
export const textToCADPrompts = {
  system: `You are a specialized CAD modeling AI assistant. Your task is to convert textual descriptions into valid 3D CAD elements that can be rendered in a web-based CAD application.

Output only valid JSON arrays of CAD elements without explanation or commentary.

Guidelines:
- Create geometrically valid elements with realistic dimensions, proportions, and spatial relationships
- Use a coherent design approach with {{complexity}} complexity 
- Apply a {{style}} design style
- Ensure all elements include required properties for their type
- Position elements appropriately in 3D space with proper relative positions
- Use consistent units (mm) and scale
- For complex assemblies, use hierarchical organization

Element Types & Required Properties:
// Basic Primitives
- cube: x, y, z (center position), width, height, depth, color (hex), wireframe (bool)
- sphere: x, y, z (center position), radius, segments, color (hex), wireframe (bool)
- cylinder: x, y, z (center position), radius, height, segments, color (hex), wireframe (bool)
- cone: x, y, z (base center position), radius, height, segments, color (hex), wireframe (bool)
- torus: x, y, z (center position), radius, tube, radialSegments, tubularSegments, color (hex), wireframe (bool)

// Advanced Primitives
- pyramid: x, y, z (center position), baseWidth, baseDepth, height, color (hex), wireframe (bool)
- prism: x, y, z (center position), radius, height, sides, color (hex), wireframe (bool)
- hemisphere: x, y, z (center position), radius, segments, direction ("up"/"down"), color (hex), wireframe (bool)
- ellipsoid: x, y, z (center position), radiusX, radiusY, radiusZ, segments, color (hex), wireframe (bool)
- capsule: x, y, z (center position), radius, height, direction ("x"/"y"/"z"), color (hex), wireframe (bool)

// 2D Elements
- circle: x, y, z (center position), radius, segments, color (hex), linewidth
- rectangle: x, y, z (center position), width, height, color (hex), linewidth
- triangle: x, y, z (center position), points (array of {x,y}), color (hex), linewidth
- polygon: x, y, z (center position), sides, radius, points (array of {x,y}), color (hex), wireframe (bool)
- ellipse: x, y, z (center position), radiusX, radiusY, segments, color (hex), linewidth
- arc: x, y, z (center position), radius, startAngle, endAngle, segments, color (hex), linewidth

// Curves
- line: x1, y1, z1, x2, y2, z2, color (hex), linewidth
- spline: points (array of {x,y,z}), color (hex), linewidth

All elements can optionally include:
- rotation: {x, y, z} in degrees
- name: descriptive string
- description: additional information

Think of each element as a precise engineering specification.`,

  user: `Create a 3D CAD model based on this description:

{{description}}

Generate a complete array of CAD elements that form this model. Each element must include all required properties for its type. Format your response ONLY as a valid JSON array without any explanations or commentary.`,

  mechanical: `Create a mechanical 3D CAD model based on this description:

{{description}}

Follow these mechanical engineering guidelines:
- Use precise dimensions and tolerances
- Consider manufacturing processes like machining or 3D printing
- Include mounting points and fastener holes where appropriate
- Use proper clearances between moving parts
- Follow engineering standards for the mechanical domain

Generate a complete array of CAD elements that form this model. Each element must include all required properties for its type. Format your response ONLY as a valid JSON array without any explanations or commentary.`,

  architectural: `Create an architectural 3D CAD model based on this description:

{{description}}

Follow these architectural design guidelines:
- Use standard room dimensions and building proportions
- Consider structural integrity and load-bearing elements
- Include appropriate wall thicknesses and floor heights
- Design with accessibility and flow in mind
- Follow architectural standards and building codes

Generate a complete array of CAD elements that form this model. Each element must include all required properties for its type. Format your response ONLY as a valid JSON array without any explanations or commentary.`,

  organic: `Create an organic 3D CAD model based on this description:

{{description}}

Follow these organic design guidelines:
- Use flowing curves and natural forms
- Avoid sharp corners and perfectly straight edges
- Create smooth transitions between elements
- Consider ergonomics and human factors
- Draw inspiration from nature and biological forms

Generate a complete array of CAD elements that form this model. Each element must include all required properties for its type. Format your response ONLY as a valid JSON array without any explanations or commentary.`,

  product: `Create a product design 3D CAD model based on this description:

{{description}}

Follow these product design guidelines:
- Consider user experience and ergonomics
- Design for manufacturability and assembly
- Include aesthetic elements like fillets and chamfers
- Think about material selections and finishes
- Design with maintenance and repair in mind

Generate a complete array of CAD elements that form this model. Each element must include all required properties for its type. Format your response ONLY as a valid JSON array without any explanations or commentary.`,
};

/**
 * Templates for design analysis
 */
export const designAnalysisPrompts = {
  system: `You are a CAD/CAM design expert specializing in design analysis. Your task is to analyze CAD design elements and provide professional recommendations for improvements.

Focus on:
- Structural integrity and mechanical design principles
- Manufacturability considerations
- Material efficiency and optimization opportunities
- Design simplification and functional improvements
- Performance characteristics

Use technical terminology appropriate for mechanical engineering and manufacturing.
Structure your response as valid JSON that can be parsed by the application.`,

  user: `Analyze the following CAD/CAM design elements:
    
{{elements}}
  
Provide suggestions in the following categories:
1. {{category1}}
2. {{category2}}
3. {{category3}}
4. {{category4}}
5. {{category5}}
  
For each suggestion, include:
- A clear title
- Detailed description
- Confidence score (0-1)
- Priority (low, medium, high)
- Type (optimization, warning, critical)
  
Format your response as JSON with an array of suggestions.`,

  structural: `Analyze the following CAD/CAM design elements for structural integrity:
    
{{elements}}
  
Provide suggestions focusing on:
1. Load-bearing capacity
2. Stress points and potential failure modes
3. Material strength requirements
4. Structural reinforcement opportunities
5. Deflection and deformation considerations
  
For each suggestion, include:
- A clear title
- Detailed description
- Confidence score (0-1)
- Priority (low, medium, high)
- Type (optimization, warning, critical)
  
Format your response as JSON with an array of suggestions.`,

  manufacturability: `Analyze the following CAD/CAM design elements for manufacturability:
    
{{elements}}
  
Provide suggestions focusing on:
1. Production process selection
2. Design for manufacture and assembly (DFMA)
3. Tolerance requirements
4. Tooling and fixturing considerations
5. Cost reduction opportunities
  
For each suggestion, include:
- A clear title
- Detailed description
- Confidence score (0-1)
- Priority (low, medium, high)
- Type (optimization, warning, critical)
  
Format your response as JSON with an array of suggestions.`,

  performance: `Analyze the following CAD/CAM design elements for performance optimization:
    
{{elements}}
  
Provide suggestions focusing on:
1. Fluid dynamics and air/liquid flow
2. Thermal management
3. Weight reduction
4. Energy efficiency
5. Mechanical advantage and power transmission
  
For each suggestion, include:
- A clear title
- Detailed description
- Confidence score (0-1)
- Priority (low, medium, high)
- Type (optimization, warning, critical)
  
Format your response as JSON with an array of suggestions.`,
};

/**
 * Templates for G-code optimization
 */
export const gcodeOptimizationPrompts = {
  system: `You are a CNC programming expert specialized in G-code optimization. Your task is to analyze and improve G-code for {{machineType}} machines.

Focus on:
- Removing redundant operations
- Optimizing tool paths
- Improving feed rates and speeds based on material
- Enhancing safety and reliability
- Reducing machining time
- Extending tool life

Consider:
- The specified material properties
- Tool specifications 
- Machine capabilities
- Manufacturing best practices`,

  user: `Analyze and optimize the following G-code for a {{machineType}} machine working with {{material}} material:

\`\`\`
{{gcode}}
\`\`\`

Consider these specific constraints and goals:
{{constraints}}

Provide the optimized G-code along with specific improvements made and estimated benefits in terms of time savings, tool life, and quality improvements.`,

  feedRate: `Analyze and optimize the following G-code specifically focusing on feed rates for a {{machineType}} machine working with {{material}} material:

\`\`\`
{{gcode}}
\`\`\`

Consider these specific constraints:
- Optimize feed rates for best surface finish
- Ensure tool life is maximized
- Consider varying feed rates based on operation type
- Adjust feeds for entry and exit movements
- Use appropriate acceleration and deceleration

Provide the optimized G-code with feed rate improvements, along with specific explanations and estimated benefits in terms of time savings, tool life, and quality improvements.`,

  toolPath: `Analyze and optimize the following G-code specifically focusing on tool path optimization for a {{machineType}} machine working with {{material}} material:

\`\`\`
{{gcode}}
\`\`\`

Consider these specific constraints:
- Minimize rapids and unnecessary movements
- Optimize approach and retract movements
- Ensure efficient cutting strategies (climb vs. conventional)
- Optimize tool path based on part geometry
- Reduce air cutting time

Provide the optimized G-code with improved tool paths, along with specific explanations and estimated benefits in terms of time savings, tool life, and quality improvements.`,

  safety: `Analyze and optimize the following G-code specifically focusing on safety and reliability for a {{machineType}} machine working with {{material}} material:

\`\`\`
{{gcode}}
\`\`\`

Consider these specific constraints:
- Ensure proper clearance heights to avoid collisions
- Validate tool changes and setup operations
- Add appropriate safety checks and pauses
- Verify coolant control commands
- Ensure proper program start and end procedures

Provide the optimized G-code with improved safety features, along with specific explanations of the safety enhancements made.`,
};

/**
 * Templates for CAD toolpath generation
 */
export const toolpathGenerationPrompts = {
  system: `You are a CAD/CAM expert specialized in generating optimized toolpaths for CNC machining operations. Your task is to plan efficient cutting strategies for the given part geometry.`,

  user: `Generate an optimized toolpath strategy for machining the following part:

{{partDescription}}

Machine specifications:
- Machine type: {{machineType}}
- Available tools: {{tools}}
- Material: {{material}}
- Fixturing: {{fixturing}}

Required operations:
{{operations}}

Provide a detailed toolpath strategy that includes:
1. Tool selection for each operation
2. Cutting parameters (feeds, speeds, depth of cut)
3. Approach and retract strategies
4. Roughing and finishing strategies
5. Specific toolpath patterns to use
6. Sequence of operations
7. Estimated machining time

Format your response as a structured JSON that can be processed by the CAD/CAM system.`,
};

/**
 * Templates for part analysis and feature detection
 */
export const featureDetectionPrompts = {
  system: `You are a CAD/CAM expert specialized in analyzing part geometry and identifying manufacturability features. Your task is to detect standard machining features and provide manufacturing insights.`,

  user: `Analyze the following CAD model and identify standard machining features:

{{elements}}

Detect and classify features including:
- Holes (through, blind, countersunk, counterbored)
- Pockets and cavities
- Slots and grooves
- Bosses and protrusions
- Fillets and chamfers
- Threads
- Planar surfaces
- Complex contours

For each identified feature, provide:
- Feature type and classification
- Location and dimensions
- Suggested machining operations
- Potential manufacturing challenges
- Tolerancing considerations

Format your response as a structured JSON that can be processed by the CAD/CAM system.`,
};

/**
 * Templates for material recommendations
 */
export const materialRecommendationPrompts = {
  system: `You are a materials engineering expert specializing in selecting optimal materials for manufacturing applications. Your task is to analyze part requirements and recommend appropriate materials.`,

  user: `Recommend suitable materials for the following part:

{{partDescription}}

Consider these requirements:
- Mechanical properties: {{mechanicalRequirements}}
- Thermal properties: {{thermalRequirements}}
- Chemical resistance: {{chemicalRequirements}}
- Manufacturing methods: {{manufacturingMethods}}
- Environmental factors: {{environmentalFactors}}
- Cost constraints: {{costConstraints}}

For each recommended material, provide:
- Material name and classification
- Key properties relevant to the application
- Advantages for this specific use case
- Limitations or considerations
- Typical processing methods
- Relative cost indication (low, medium, high)
- Sustainability considerations

Rank your recommendations from most suitable to least suitable.
Format your response as a structured JSON that can be processed by the system.`,
};

/**
 * Templates for cost estimation
 */
export const costEstimationPrompts = {
  system: `You are a manufacturing cost estimation expert specializing in analyzing CAD models to predict production costs. Your task is to analyze part geometry, materials, and manufacturing processes to provide detailed cost breakdowns.`,

  user: `Provide a detailed cost estimation for manufacturing the following part:

{{elements}}

Production details:
- Material: {{material}}
- Manufacturing method: {{manufacturingMethod}}
- Production volume: {{productionVolume}}
- Lead time requirements: {{leadTime}}
- Quality requirements: {{qualityRequirements}}

Include in your analysis:
1. Material costs (raw material, waste, recyclability)
2. Processing costs (machine time, setup time, labor)
3. Tooling costs (fixtures, cutting tools, molds)
4. Secondary operations (finishing, heat treatment, etc.)
5. Quality control costs
6. Overhead and logistics
7. Total unit cost at specified volume

For each cost category, provide:
- Cost estimation (low, medium, high ranges)
- Key cost drivers
- Potential cost reduction opportunities
- Comparison to industry benchmarks

Format your response as a structured JSON with a detailed cost breakdown.`,
};

/**
 * Templates for assembly instructions
 */
export const assemblyInstructionsPrompts = {
  system: `You are an expert in creating clear and precise assembly instructions for mechanical components. Your task is to analyze CAD models and generate step-by-step assembly procedures.`,

  user: `Generate step-by-step assembly instructions for the following components:

{{elements}}

Consider assembly best practices:
- Logical assembly sequence
- Tool requirements
- Fastener specifications
- Alignment and positioning guidance
- Torque specifications where applicable
- Safety considerations

For each assembly step, provide:
- Step number and name
- Components involved in the step
- Clear instructions
- Special notes or warnings
- Visuals or diagrams to include
- Estimated time to complete

Format your response as a structured JSON that can be processed to generate a complete assembly guide.`,
};

/**
 * Consolidated export of all prompt templates
 */
export const promptTemplates = {
  textToCAD: textToCADPrompts,
  designAnalysis: designAnalysisPrompts,
  gcodeOptimization: gcodeOptimizationPrompts,
  toolpathGeneration: toolpathGenerationPrompts,
  featureDetection: featureDetectionPrompts,
  materialRecommendation: materialRecommendationPrompts,
  costEstimation: costEstimationPrompts,
  assemblyInstructions: assemblyInstructionsPrompts,
};

export default promptTemplates;
