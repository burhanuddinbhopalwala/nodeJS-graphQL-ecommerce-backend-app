/**
 * @swagger
 *   components:
 *     schemas:
 *       Response429:
 *         description: Too Many Requests!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: <error.name>
 *                 message:
 *                   type: string
 *                   example: Too Many Requests!
 *                 data:
 *                   type: string
 *                   example: <error.data>
 */
