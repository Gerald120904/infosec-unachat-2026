var { test, expect } = require('@playwright/test');

function openChat(page) {
  var connection = page.waitForEvent('websocket', function (websocket) {
    return websocket.url().indexOf('/socket.io/') !== -1;
  });

  return page.goto('/').then(function () {
    return connection;
  });
}

function sendMessage(page, nombre, mensaje) {
  return page.locator('#nombre').fill(nombre).then(function () {
    return page.locator('#m').fill(mensaje);
  }).then(function () {
    return page.getByRole('button', { name: 'Send' }).click();
  });
}

test.describe('Chat page', function () {

  test.describe('when a visitor opens the chat', function () {

    test('should show the username, message, and send controls', async function ({ page }) {
      await openChat(page);

      await expect(page).toHaveTitle('Chat Socket.IO UNA');
      await expect(page.locator('#nombre')).toBeVisible();
      await expect(page.locator('#m')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();
    });

  });

  test.describe('when a user sends a plain message', function () {

    test('should show the message in the chat', async function ({ page }) {
      await openChat(page);
      await sendMessage(page, 'Ana', 'hola desde el navegador');

      var item = page.locator('#messages li').last();
      await expect(item).toContainText('Ana');
      await expect(item).toContainText('hola desde el navegador');
      await expect(page.locator('#m')).toHaveValue('');
    });

    test('should show that message to another visitor', async function ({ browser }) {
      var senderContext = await browser.newContext();
      var receiverContext = await browser.newContext();
      var sender = await senderContext.newPage();
      var receiver = await receiverContext.newPage();

      try {
        await openChat(sender);
        await openChat(receiver);
        await sendMessage(sender, 'Ana', 'hola a todos');

        var item = receiver.locator('#messages li').last();
        await expect(item).toContainText('Ana');
        await expect(item).toContainText('hola a todos');
      } finally {
        await senderContext.close();
        await receiverContext.close();
      }
    });

  });

  test.describe('when a user sends a script tag', function () {

    test('should show the script as text and not run it', async function ({ page }) {
      var dialogs = [];
      page.on('dialog', function (dialog) {
        dialogs.push(dialog.message());
        return dialog.dismiss();
      });

      await openChat(page);
      await sendMessage(page, '<script>alert(1)</script>', '<script>alert(1)</script>');

      var item = page.locator('#messages li').last();
      await expect(item).toContainText('<script>alert(1)</script>');
      await expect(item.locator('script')).toHaveCount(0);
      expect(dialogs).toEqual([]);
    });

  });

  test.describe('when a user sends an image url', function () {

    test('should show the image in the chat', async function ({ page }) {
      await openChat(page);
      await sendMessage(page, 'Ana', 'http://image.com/image.jpg');

      var image = page.locator('#messages img');
      await expect(image).toHaveAttribute('src', 'http://image.com/image.jpg');
      await expect(page.locator('#messages script')).toHaveCount(0);
    });

  });

  test.describe('when a user sends a youtube url', function () {

    test('should show the embedded video', async function ({ page }) {
      await openChat(page);
      await sendMessage(page, 'Ana', 'https://www.youtube.com/watch?v=qYwlqx-JLok');

      var frame = page.locator('#messages iframe');
      await expect(frame).toHaveAttribute('src', /youtube\.com\/embed\/qYwlqx-JLok/);
      await expect(page.locator('#messages script')).toHaveCount(0);
    });

  });

});
