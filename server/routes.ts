import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // 1. Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // 2. Register Integrations
  registerChatRoutes(app);
  registerImageRoutes(app);

  // 3. Register Application Routes
  
  // PROJECTS
  app.get(api.projects.list.path, isAuthenticated, async (req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.post(api.projects.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.projects.create.input.parse(req.body);
      const project = await storage.createProject(input);
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.get(api.projects.get.path, isAuthenticated, async (req, res) => {
    const project = await storage.getProject(Number(req.params.id));
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  });

  app.patch(api.projects.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.projects.update.input.parse(req.body);
      const project = await storage.updateProject(Number(req.params.id), input);
      res.json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.delete(api.projects.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteProject(Number(req.params.id));
    res.status(204).send();
  });

  // AGENTS
  app.get(api.agents.list.path, isAuthenticated, async (req, res) => {
    const agents = await storage.getAgents();
    res.json(agents);
  });

  app.post(api.agents.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.agents.create.input.parse(req.body);
      const agent = await storage.createAgent(input);
      res.status(201).json(agent);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // SKILLS
  app.get(api.skills.list.path, isAuthenticated, async (req, res) => {
    const skills = await storage.getSkills();
    res.json(skills);
  });

  app.post(api.skills.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.skills.create.input.parse(req.body);
      const skill = await storage.createSkill(input);
      res.status(201).json(skill);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // PROMPTS
  app.get(api.prompts.list.path, isAuthenticated, async (req, res) => {
    const prompts = await storage.getPrompts();
    res.json(prompts);
  });

  app.post(api.prompts.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.prompts.create.input.parse(req.body);
      const prompt = await storage.createPrompt(input);
      res.status(201).json(prompt);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Seed Data Endpoint (For demo purposes)
  app.post("/api/seed", async (req, res) => {
    // Only allow if no data exists? Or just append.
    // For now, let's just add some sample skills/prompts if empty
    const skills = await storage.getSkills();
    if (skills.length === 0) {
      // Create some sample skills
      await storage.createSkill({
        name: "Authentication Patterns",
        description: "Implement secure JWT authentication with refresh tokens.",
        code: "// Auth implementation...",
        userId: "system",
        category: "official"
      });
      await storage.createSkill({
        name: "Error Handling Best Practices",
        description: "Implement robust error handling with custom error classes.",
        code: "// Error handling...",
        userId: "system",
        category: "official"
      });
      await storage.createSkill({
        name: "Vitest Unit Testing",
        description: "Write fast unit tests with Vitest and proper mocking.",
        code: "// Testing...",
        userId: "system",
        category: "official"
      });
    }

    const prompts = await storage.getPrompts();
    if (prompts.length === 0) {
      await storage.createPrompt({
        title: "Build Data Table",
        content: "Build a data table with TanStack Table for sorting and actions.",
        userId: "system",
        category: "development",
        tags: ["react", "table"]
      });
      await storage.createPrompt({
        title: "Create Modal Component",
        content: "Create an accessible modal component with Radix UI.",
        userId: "system",
        category: "development",
        tags: ["react", "ui"]
      });
    }

    res.json({ message: "Database seeded" });
  });

  return httpServer;
}
