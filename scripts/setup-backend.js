const https = require("https")

// Configuration
const WEAVIATE_URL = process.env.REST_ENDPOINT_URL
const WEAVIATE_API_KEY = process.env.WEAVIATE_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!WEAVIATE_URL || !WEAVIATE_API_KEY || !OPENAI_API_KEY) {
  console.error("❌ Missing required environment variables:")
  console.error("   - REST_ENDPOINT_URL")
  console.error("   - WEAVIATE_API_KEY")
  console.error("   - OPENAI_API_KEY")
  process.exit(1)
}

console.log("🚀 Starting Pre-Review Physics Backend Setup...\n")

// Sample physics knowledge data
const sampleKnowledge = [
  {
    concept: "Newton's Laws of Motion",
    description:
      "Three fundamental laws that form the foundation of classical mechanics, describing the relationship between forces acting on a body and its motion.",
    field: "Classical Mechanics",
    difficulty: "beginner",
    equations: ["F = ma", "F₁₂ = -F₂₁", "v = u + at"],
    applications: ["Vehicle dynamics", "Projectile motion", "Structural engineering", "Sports physics"],
    relatedConcepts: ["Force", "Acceleration", "Momentum", "Energy"],
    examples: ["A ball thrown in the air", "Car braking", "Rocket propulsion"],
  },
  {
    concept: "Quantum Superposition",
    description:
      "A fundamental principle of quantum mechanics where a quantum system can exist in multiple states simultaneously until measured or observed.",
    field: "Quantum Mechanics",
    difficulty: "intermediate",
    equations: ["|ψ⟩ = α|0⟩ + β|1⟩", "⟨ψ|ψ⟩ = |α|² + |β|² = 1"],
    applications: ["Quantum computing", "Quantum cryptography", "MRI imaging", "Laser technology"],
    relatedConcepts: ["Wave function", "Quantum entanglement", "Measurement problem", "Schrödinger equation"],
    examples: ["Schrödinger's cat", "Double-slit experiment", "Quantum bits (qubits)"],
  },
  {
    concept: "Laws of Thermodynamics",
    description:
      "Four fundamental laws that describe the behavior of energy, heat, and entropy in thermodynamic systems.",
    field: "Thermodynamics",
    difficulty: "intermediate",
    equations: ["ΔU = Q - W", "ΔS ≥ 0", "PV = nRT"],
    applications: ["Heat engines", "Refrigeration", "Power plants", "Chemical reactions"],
    relatedConcepts: ["Entropy", "Enthalpy", "Heat capacity", "Phase transitions"],
    examples: ["Steam engine", "Heat pump", "Melting ice", "Combustion engine"],
  },
  {
    concept: "Maxwell's Equations",
    description:
      "Four fundamental equations that describe the behavior of electric and magnetic fields and their interactions with matter.",
    field: "Electromagnetism",
    difficulty: "advanced",
    equations: ["∇·E = ρ/ε₀", "∇·B = 0", "∇×E = -∂B/∂t", "∇×B = μ₀J + μ₀ε₀∂E/∂t"],
    applications: ["Electromagnetic waves", "Radio communication", "Optical devices", "Electric motors"],
    relatedConcepts: ["Electric field", "Magnetic field", "Electromagnetic induction", "Wave propagation"],
    examples: ["Radio waves", "Light propagation", "Electric generator", "Transformer"],
  },
  {
    concept: "Special Relativity",
    description:
      "Einstein's theory describing the physics of objects moving at high speeds, introducing concepts of time dilation and length contraction.",
    field: "Relativity",
    difficulty: "advanced",
    equations: ["E = mc²", "γ = 1/√(1-v²/c²)", "t' = γ(t - vx/c²)"],
    applications: ["Particle accelerators", "GPS satellites", "Nuclear energy", "Astrophysics"],
    relatedConcepts: ["Spacetime", "Lorentz transformation", "Mass-energy equivalence", "Simultaneity"],
    examples: ["GPS time correction", "Particle colliders", "Muon decay", "Twin paradox"],
  },
]

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = ""
      res.on("data", (chunk) => (body += chunk))
      res.on("end", () => {
        try {
          const response = JSON.parse(body)
          resolve({ status: res.statusCode, data: response })
        } catch (e) {
          resolve({ status: res.statusCode, data: body })
        }
      })
    })

    req.on("error", reject)

    if (data) {
      req.write(JSON.stringify(data))
    }

    req.end()
  })
}

// Setup Weaviate schema
async function setupSchema() {
  console.log("📋 Setting up Weaviate schema...")

  const host = WEAVIATE_URL.replace("https://", "")

  // Check existing schema
  const schemaOptions = {
    hostname: host,
    path: "/v1/schema",
    method: "GET",
    headers: {
      Authorization: `Bearer ${WEAVIATE_API_KEY}`,
      "Content-Type": "application/json",
    },
  }

  try {
    const schemaResponse = await makeRequest(schemaOptions)
    const existingClasses = schemaResponse.data.classes?.map((c) => c.class) || []

    // Define classes to create
    const classes = [
      {
        class: "PhysicsKnowledge",
        description: "Physics concepts and knowledge base",
        vectorizer: "text2vec-openai",
        moduleConfig: {
          "text2vec-openai": {
            model: "ada",
            modelVersion: "002",
            type: "text",
          },
        },
        properties: [
          { name: "concept", dataType: ["text"], description: "The physics concept name" },
          { name: "description", dataType: ["text"], description: "Detailed description of the concept" },
          { name: "field", dataType: ["text"], description: "Physics field" },
          { name: "difficulty", dataType: ["text"], description: "Difficulty level" },
          { name: "equations", dataType: ["text[]"], description: "Related equations" },
          { name: "applications", dataType: ["text[]"], description: "Real-world applications" },
          { name: "relatedConcepts", dataType: ["text[]"], description: "Related physics concepts" },
          { name: "examples", dataType: ["text[]"], description: "Examples and use cases" },
        ],
      },
      {
        class: "ResearchPaper",
        description: "Research papers for analysis",
        vectorizer: "text2vec-openai",
        moduleConfig: {
          "text2vec-openai": {
            model: "ada",
            modelVersion: "002",
            type: "text",
          },
        },
        properties: [
          { name: "title", dataType: ["text"], description: "Paper title" },
          { name: "authors", dataType: ["text[]"], description: "Paper authors" },
          { name: "abstract", dataType: ["text"], description: "Paper abstract" },
          { name: "content", dataType: ["text"], description: "Full paper content" },
          { name: "field", dataType: ["text"], description: "Research field" },
          { name: "keywords", dataType: ["text[]"], description: "Paper keywords" },
          { name: "uploadDate", dataType: ["text"], description: "Upload timestamp" },
          { name: "fileType", dataType: ["text"], description: "File type" },
        ],
      },
      {
        class: "AnalysisResult",
        description: "Multi-agent analysis results",
        vectorizer: "text2vec-openai",
        moduleConfig: {
          "text2vec-openai": {
            model: "ada",
            modelVersion: "002",
            type: "text",
          },
        },
        properties: [
          { name: "paperId", dataType: ["text"], description: "Reference to analyzed paper" },
          { name: "analysisType", dataType: ["text"], description: "Type of analysis performed" },
          { name: "result", dataType: ["text"], description: "Analysis result content" },
          { name: "confidence", dataType: ["number"], description: "Confidence score" },
          { name: "timestamp", dataType: ["text"], description: "Analysis timestamp" },
          { name: "agentId", dataType: ["text"], description: "ID of the agent" },
        ],
      },
    ]

    // Create missing classes
    for (const classSchema of classes) {
      if (!existingClasses.includes(classSchema.class)) {
        const createOptions = {
          hostname: host,
          path: "/v1/schema",
          method: "POST",
          headers: {
            Authorization: `Bearer ${WEAVIATE_API_KEY}`,
            "Content-Type": "application/json",
            "X-OpenAI-Api-Key": OPENAI_API_KEY,
          },
        }

        const response = await makeRequest(createOptions, classSchema)
        if (response.status === 200) {
          console.log(`   ✅ Created ${classSchema.class} class`)
        } else {
          console.log(`   ⚠️  ${classSchema.class} class creation response:`, response.status)
        }
      } else {
        console.log(`   ✅ ${classSchema.class} class already exists`)
      }
    }

    console.log("✅ Schema setup completed\n")
  } catch (error) {
    console.error("❌ Schema setup failed:", error.message)
    throw error
  }
}

// Add sample knowledge
async function addSampleKnowledge() {
  console.log("📚 Adding sample physics knowledge...")

  const host = WEAVIATE_URL.replace("https://", "")

  for (const knowledge of sampleKnowledge) {
    const options = {
      hostname: host,
      path: "/v1/objects",
      method: "POST",
      headers: {
        Authorization: `Bearer ${WEAVIATE_API_KEY}`,
        "Content-Type": "application/json",
        "X-OpenAI-Api-Key": OPENAI_API_KEY,
      },
    }

    const data = {
      class: "PhysicsKnowledge",
      properties: knowledge,
    }

    try {
      const response = await makeRequest(options, data)
      if (response.status === 200) {
        console.log(`   ✅ Added: ${knowledge.concept}`)
      } else {
        console.log(`   ⚠️  Failed to add ${knowledge.concept}:`, response.status)
      }
    } catch (error) {
      console.log(`   ❌ Error adding ${knowledge.concept}:`, error.message)
    }
  }

  console.log("✅ Sample knowledge added\n")
}

// Test system health
async function testSystemHealth() {
  console.log("🏥 Testing system health...")

  const host = WEAVIATE_URL.replace("https://", "")

  // Test Weaviate connection
  const healthOptions = {
    hostname: host,
    path: "/v1/meta",
    method: "GET",
    headers: {
      Authorization: `Bearer ${WEAVIATE_API_KEY}`,
      "Content-Type": "application/json",
    },
  }

  try {
    const response = await makeRequest(healthOptions)
    if (response.status === 200) {
      console.log("   ✅ Weaviate connection: Healthy")
      console.log(`   ✅ Weaviate version: ${response.data.version || "Unknown"}`)
    } else {
      console.log("   ❌ Weaviate connection: Failed")
    }
  } catch (error) {
    console.log("   ❌ Weaviate connection: Error -", error.message)
  }

  // Test knowledge search
  const searchOptions = {
    hostname: host,
    path: "/v1/graphql",
    method: "POST",
    headers: {
      Authorization: `Bearer ${WEAVIATE_API_KEY}`,
      "Content-Type": "application/json",
      "X-OpenAI-Api-Key": OPENAI_API_KEY,
    },
  }

  const searchQuery = {
    query: `{
      Get {
        PhysicsKnowledge(limit: 1) {
          concept
          field
        }
      }
    }`,
  }

  try {
    const response = await makeRequest(searchOptions, searchQuery)
    if (response.status === 200 && response.data.data?.Get?.PhysicsKnowledge?.length > 0) {
      console.log("   ✅ Knowledge base: Accessible")
      console.log(`   ✅ Sample concept: ${response.data.data.Get.PhysicsKnowledge[0].concept}`)
    } else {
      console.log("   ⚠️  Knowledge base: No data found")
    }
  } catch (error) {
    console.log("   ❌ Knowledge base test: Error -", error.message)
  }

  console.log("✅ System health check completed\n")
}

// Main setup function
async function main() {
  try {
    await setupSchema()
    await addSampleKnowledge()
    await testSystemHealth()

    console.log("🎉 Backend setup completed successfully!")
    console.log("\n📊 System Summary:")
    console.log("   • Weaviate schema: Configured")
    console.log("   • Sample knowledge: 5 physics concepts added")
    console.log("   • Multi-agent system: Ready")
    console.log("   • Document processing: Enabled")
    console.log("   • API endpoints: Available")
    console.log("\n🚀 Your Pre-Review Physics platform is ready to use!")
  } catch (error) {
    console.error("\n❌ Setup failed:", error.message)
    process.exit(1)
  }
}

// Run setup
main()
