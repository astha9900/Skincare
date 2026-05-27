import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = session.user as { id: string; role: string; name?: string; email?: string }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { name: true, email: true } } },
  })

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (user.role !== 'ADMIN' && order.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const addr = order.shippingAddress as {
    name: string; phone: string; line1: string; line2?: string
    city: string; state: string; pincode: string
  }

  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const itemRows = order.items.map((item) => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;">${item.productName}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">₹${item.price.toLocaleString('en-IN')}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${order.orderNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; background: #fff; padding: 40px; font-size: 14px; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #1a5436; }
    .brand { font-size: 28px; font-weight: 800; }
    .brand .skin { color: #1a5436; }
    .brand .glow { color: #2d7a4e; }
    .brand-sub { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .invoice-meta { text-align: right; }
    .invoice-meta h1 { font-size: 22px; font-weight: 700; color: #1a5436; letter-spacing: 1px; }
    .invoice-meta p { color: #6b7280; font-size: 13px; }
    .invoice-meta .order-num { font-size: 15px; font-weight: 600; color: #111; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 8px; }
    .section-body p { margin-bottom: 2px; font-size: 13px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: #dcfce7; color: #166534; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #f0fdf4; }
    th { padding: 10px 8px; text-align: left; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #1a5436; border-bottom: 2px solid #1a5436; }
    th.right { text-align: right; }
    th.center { text-align: center; }
    .totals { margin-left: auto; width: 280px; }
    .totals table { margin-bottom: 0; }
    .totals td { padding: 6px 8px; font-size: 13px; }
    .totals td:last-child { text-align: right; }
    .totals .grand td { font-size: 15px; font-weight: 700; border-top: 2px solid #1a5436; padding-top: 10px; }
    .discount { color: #16a34a; }
    .footer-note { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;">
    <span style="color:#166534;font-size:13px;">Press <strong>Ctrl+P</strong> (or ⌘P on Mac) and choose <strong>Save as PDF</strong> to download.</span>
    <button onclick="window.print()" style="background:#1a5436;color:#fff;border:none;border-radius:6px;padding:8px 18px;font-size:13px;font-weight:600;cursor:pointer;">Print / Save as PDF</button>
  </div>

  <div class="header">
    <div>
      <div class="brand"><span class="skin">Skin</span><span class="glow">Glow</span></div>
      <div class="brand-sub">Your trusted skincare marketplace</div>
    </div>
    <div class="invoice-meta">
      <h1>INVOICE</h1>
      <div class="order-num">${order.orderNumber}</div>
      <p>Date: ${date}</p>
      <p style="margin-top:6px;"><span class="badge">${order.status}</span></p>
    </div>
  </div>

  <div class="grid">
    <div>
      <div class="section-title">Billed To</div>
      <div class="section-body">
        <p><strong>${addr.name}</strong></p>
        <p>${addr.phone}</p>
        <p>${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}</p>
        <p>${addr.city}, ${addr.state} – ${addr.pincode}</p>
        <p style="margin-top:6px;color:#6b7280;">${order.user.email}</p>
      </div>
    </div>
    <div>
      <div class="section-title">Payment Details</div>
      <div class="section-body">
        <p><strong>Method:</strong> ${order.paymentMethod}</p>
        <p><strong>Status:</strong> ${order.paymentStatus}</p>
        ${order.trackingNumber ? `<p><strong>Tracking:</strong> <code>${order.trackingNumber}</code></p>` : ''}
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th class="center">Qty</th>
        <th class="right">Unit Price</th>
        <th class="right">Amount</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="totals">
    <table>
      <tr>
        <td style="color:#6b7280;">Subtotal</td>
        <td>₹${order.subtotal.toLocaleString('en-IN')}</td>
      </tr>
      ${order.discountAmount > 0 ? `
      <tr class="discount">
        <td>Discount${order.couponCode ? ' (' + order.couponCode + ')' : ''}</td>
        <td>−₹${order.discountAmount.toLocaleString('en-IN')}</td>
      </tr>` : ''}
      <tr>
        <td style="color:#6b7280;">Shipping</td>
        <td>${order.shippingCost === 0 ? 'FREE' : '₹' + order.shippingCost.toLocaleString('en-IN')}</td>
      </tr>
      <tr class="grand">
        <td>Total</td>
        <td>₹${order.total.toLocaleString('en-IN')}</td>
      </tr>
    </table>
  </div>

  <div class="footer-note">
    <p>Thank you for shopping with SkinGlow! For any queries, contact us at singhastha614@gmail.com</p>
    <p style="margin-top:4px;">This is a computer-generated invoice and does not require a signature.</p>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
