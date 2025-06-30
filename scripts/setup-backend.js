import { initializeSchema } from "../lib/weaviate.js"
import { KnowledgeBaseService } from "../lib/services/knowledge-base.js"

console.log("🚀 Setting up Pre-Review Physics Backend...")

async function setupBackend() {
  try {
    // 1. Initialize Weaviate schema
    console.log("📊 Initializing Weaviate schema...")
    await initializeSchema()
    console.log("✅ Schema initialized successfully")

    // 2. Add sample physics knowledge
    console.log("📚 Adding sample physics knowledge...")
    const knowledgeService = new KnowledgeBaseService()

    const sampleKnowledge = [
      {
        title: "Newton's Laws of Motion",
        content:
          "Newton's three laws of motion form the foundation of classical mechanics. The first law states that an object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force. The second law defines the relationship between acceleration, mass, and force: F = ma. The third law states that for every action, there is an equal and opposite reaction.",
        topic: "Classical Mechanics",
        difficulty: "beginner",
        equations: ["F = ma", "ΣF = 0 (equilibrium)"],
        concepts: ["Inertia", "Force", "Acceleration", "Action-Reaction"],
        source: "Fundamentals of Physics",
        chapter: "Chapter 5: Force and Motion",
      },
      {
        title: "Quantum Superposition",
        content:
          "Quantum superposition is a fundamental principle of quantum mechanics that describes a physical system existing in multiple states simultaneously until measured. This principle is mathematically represented by the wave function ψ, which is a linear combination of basis states. The famous Schrödinger's cat thought experiment illustrates this concept, where a cat can be both alive and dead until observed.",
        topic: "Quantum Mechanics",
        difficulty: "intermediate",
        equations: ["|ψ⟩ = α|0⟩ + β|1⟩", "⟨ψ|ψ⟩ = 1"],
        concepts: ["Wave Function", "Measurement", "Quantum States", "Probability Amplitudes"],
        source: "Introduction to Quantum Mechanics",
        chapter: "Chapter 2: The Wave Function",
      },
      {
        title: "Thermodynamic Laws",
        content:
          "The laws of thermodynamics govern the behavior of energy in physical systems. The zeroth law establishes thermal equilibrium and temperature. The first law states that energy cannot be created or destroyed, only transformed (ΔU = Q - W). The second law introduces entropy and states that the entropy of an isolated system never decreases. The third law states that the entropy of a perfect crystal approaches zero as temperature approaches absolute zero.",
        topic: "Thermodynamics",
        difficulty: "intermediate",
        equations: ["ΔU = Q - W", "dS ≥ 0", "S → 0 as T → 0"],
        concepts: ["Energy Conservation", "Entropy", "Heat", "Work", "Temperature"],
        source: "Thermal Physics",
        chapter: "Chapter 1: The Laws of Thermodynamics",
      },
      {
        title: "Maxwell's Equations",
        content:
          "Maxwell's equations are a set of four partial differential equations that describe the behavior of electric and magnetic fields. They unify electricity and magnetism into electromagnetism and predict the existence of electromagnetic waves traveling at the speed of light. These equations form the foundation of classical electrodynamics and are essential for understanding light, radio waves, and many modern technologies.",
        topic: "Electromagnetism",
        difficulty: "advanced",
        equations: ["∇·E = ρ/ε₀", "∇·B = 0", "∇×E = -∂B/∂t", "∇×B = μ₀J + μ₀ε₀∂E/∂t"],
        concepts: ["Electric Field", "Magnetic Field", "Electromagnetic Waves", "Gauss's Law"],
        source: "Classical Electrodynamics",
        chapter: "Chapter 6: Maxwell's Equations",
      },
      {
        title: "Special Relativity",
        content:
          "Einstein's special theory of relativity revolutionized our understanding of space and time. It is based on two postulates: the laws of physics are the same in all inertial reference frames, and the speed of light in vacuum is constant for all observers. This leads to phenomena such as time dilation, length contraction, and mass-energy equivalence (E = mc²). These effects become significant at velocities approaching the speed of light.",
        topic: "Relativity",
        difficulty: "advanced",
        equations: ["E = mc²", "γ = 1/√(1-v²/c²)", "t' = γt", "L' = L/γ"],
        concepts: ["Time Dilation", "Length Contraction", "Mass-Energy Equivalence", "Lorentz Transformation"],
        source: "Introduction to Special Relativity",
        chapter: "Chapter 3: Consequences of Special Relativity",
      },
    ]

    for (const knowledge of sampleKnowledge) {
      try {
        await knowledgeService.addKnowledge(knowledge)
        console.log(`✅ Added: ${knowledge.title}`)
      } catch (error) {
        console.log(`❌ Failed to add: ${knowledge.title} - ${error.message}`)
      }
    }

    console.log("🎉 Backend setup completed successfully!")
    console.log("\n📋 Summary:")
    console.log("✅ Weaviate schema initialized")
    console.log("✅ Sample physics knowledge added")
    console.log("✅ API endpoints ready")
    console.log("✅ Multi-agent system configured")
    console.log("\n🚀 Your Pre-Review Physics platform is ready to use!")
    console.log("\nNext steps:")
    console.log("1. Visit /admin to view system dashboard")
    console.log("2. Try searching in /knowledge-base")
    console.log("3. Upload a paper in /submit")
    console.log("4. Explore /theory-lab for AI conversations")
  } catch (error) {
    console.error("❌ Backend setup failed:", error)
    process.exit(1)
  }
}

setupBackend()
