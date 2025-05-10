// src/routes/index.ts
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../docs/openapi.json' with { type: 'json' };

const router = Router();

router.get('/health', (_req, res) => {
  res.sendStatus(200);
});

router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;
