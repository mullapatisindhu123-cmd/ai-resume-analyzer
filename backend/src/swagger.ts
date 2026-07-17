import { Application } from "express"
import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI Resume Analyzer API",
      version: "1.0.0",
      description: "Resume skill matching API for frontend integration and testing.",
    },
  },
  apis: ["./src/server.ts"],
}

const swaggerSpec = swaggerJsdoc(options)

export const setupSwagger = (app: Application): void => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}
