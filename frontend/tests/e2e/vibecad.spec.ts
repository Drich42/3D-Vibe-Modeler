import { test, expect } from '@playwright/test';

test.describe('VibeCAD MVP E2E', () => {
  test('should generate a CAD model and allow undo/redo', async ({ page }) => {
    // Mock the /api/generate endpoint to avoid using real LLM credits during E2E
    await page.route('/api/generate', async route => {
      const json = {
        spec: {
          version: "1.0",
          shapes: [
            {
              id: "test-cube-1",
              type: "cube",
              size: [40, 40, 40],
              position: [0, 0, 0],
              operation: "add"
            }
          ]
        }
      };
      await route.fulfill({ json });
    });

    await page.goto('/');

    // Verify initial state
    await expect(page.getByText('VibeCAD MVP')).toBeVisible();
    await expect(page.getByText('Generate a model to preview')).toBeVisible();

    // Fill in the prompt and submit (first shape)
    await page.getByTestId('prompt-input').fill('Make a 40mm cube');
    await page.getByTestId('generate-btn').click();

    // Verify generation response
    await expect(page.getByText('Generated Spec (JSON)')).toBeVisible();
    await expect(page.locator('canvas#babylon-canvas')).toBeVisible();

    // Wait for the diff visualization to finish (1s) and the scene to render
    await page.waitForTimeout(2000);

    // Initial state `modelSpec: null` isn't pushed to pastSpecs in our store implementation.
    // Let's generate a second shape to truly test undo/redo state transition.
    await page.route('/api/generate', async route => {
      const json = {
        spec: {
          version: "1.0",
          shapes: [
            {
              id: "test-cube-1",
              type: "cube",
              size: [40, 40, 40],
              position: [0, 0, 0],
              operation: "add"
            },
            {
              id: "test-sphere-1",
              type: "sphere",
              radius: 10,
              position: [0, 20, 0],
              operation: "add"
            }
          ]
        }
      };
      await route.fulfill({ json });
    });

    await page.getByTestId('prompt-input').fill('Add a sphere on top');
    await page.getByTestId('generate-btn').click();

    // We should now have 2 shapes in the JSON view. We can check for "test-sphere-1"
    await expect(page.getByText('"test-sphere-1"')).toBeVisible();

    // Click Undo
    const undoBtn = page.getByTitle('Undo');
    await expect(undoBtn).toBeEnabled();
    await undoBtn.click();
    await expect(page.getByText('"test-sphere-1"')).not.toBeVisible();
    await expect(page.getByText('"test-cube-1"')).toBeVisible();

    // Click Redo
    const redoBtn = page.getByTitle('Redo');
    await expect(redoBtn).toBeEnabled();
    await redoBtn.click();
    await expect(page.getByText('"test-sphere-1"')).toBeVisible();
  });
});
