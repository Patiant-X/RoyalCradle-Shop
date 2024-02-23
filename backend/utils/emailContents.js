export function OrderConfirmationContent(order) {
  let html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
      /* Your CSS styles here */
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        background-color: #f4f4f4;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #fff;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      h1 {
        color: #333;
        text-align: center;
      }
      p {
        color: #666;
        margin-bottom: 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      th, td {
        padding: 10px;
        border-bottom: 1px solid #ddd;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
      }
      .total {
        font-weight: bold;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
      }
      
    .website-link {
        margin-top: 40px;
        text-align: center;
      }
      .website-link a {
        color: #00a9e0;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Order Confirmation</h1>
      <p>Dear ${order.user.name},</p>
      <p>Thank you for your order! We are pleased to confirm that your order has been successfully placed on ${order.paidAt}. Below are the details of your purchase:</p>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>`;
  // Loop through the products array and generate table rows
  order.orderItems.forEach((product) => {
    html += `
      <tr>
        <td>${product.name}</td>
        <td>${product.qty}</td>
        <td>R ${product.price.toFixed(2)}</td>
      </tr>
    `;
  });

  // Add total amount row

  html += `
      </tbody>
      <tfoot>
  <tr>
    <td colspan="2">Delivery</td>
    <td>R ${order.shippingPrice.toFixed(2)}</td>
  </tr>
  <tr>
    <td colspan="2">Services</td>
    <td>R ${order.taxPrice.toFixed(2)
    }</td>
  </tr>
  <tr>
    <td colspan="2">Total</td>
    <td>R ${order.totalPrice.toFixed(2)}</td>
  </tr>
</tfoot>
    </table>
    <p>Thank you for choosing us. We hope you enjoy your purchase!</p>
    <div class="website-link">
      <a href="https://royalcradle-shop.onrender.com">Visit our website</a>
    </div>
  </div>
  `;

  // Add closing tags
  html += `
      </body>
    </html>
  `;

  return {
    message: html,
    subject: `Receipt for Your Payment`,
  };
}

export function UserResetPasswordContent(name, id, token) {
  return {
    message: `<p>Dear ${name},</p><p>We have received a request to reset your password. 
        If you did not make this request, please ignore this email.</p>
       <p>To reset your password, please click on the following link:</p>
       <p><a href="https://royalcradle-shop.onrender.com/reset-password/${id}/${token}/">
Reset Password</a></p> <p>Thank you.</p>`,
    subject: 'Password Reset Request',
  };
}

// Example usage:
//   const emailHtml = generateOrderConfirmationEmail("John Doe", "Pizza", 50.00, 50.00);
//   console.log(emailHtml);
