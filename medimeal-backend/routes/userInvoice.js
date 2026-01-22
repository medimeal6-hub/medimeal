const express = require('express');
const { auth } = require('../middleware/auth');
const Invoice = require('../models/Invoice');
const Appointment = require('../models/Appointment');

const router = express.Router();

// GET /api/user/invoices - Get all invoices for the user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const invoices = await Invoice.find({ userId })
      .populate('appointmentId', 'provider appointmentDate type')
      .sort({ invoiceDate: -1 });
    
    res.status(200).json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices'
    });
  }
});

// GET /api/user/invoices/:id - Get specific invoice
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const invoiceId = req.params.id;
    
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      userId
    }).populate('appointmentId', 'provider appointmentDate type reasonForVisit');
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice'
    });
  }
});

// GET /api/user/invoices/:id/download - Download invoice (returns JSON/HTML for PDF conversion)
router.get('/:id/download', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const invoiceId = req.params.id;
    
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      userId
    }).populate('appointmentId', 'provider appointmentDate type reasonForVisit');
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    // Get user details
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    // Generate HTML invoice (can be converted to PDF on frontend)
    const htmlInvoice = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #667eea; margin: 0; }
          .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-section { flex: 1; }
          .info-section h3 { margin-top: 0; color: #555; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .total-row { font-weight: bold; font-size: 1.1em; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MediMeal</h1>
          <p>Healthcare Invoice</p>
        </div>
        
        <div class="invoice-info">
          <div class="info-section">
            <h3>Bill To:</h3>
            <p>${user.firstName} ${user.lastName}</p>
            <p>${user.email}</p>
          </div>
          <div class="info-section" style="text-align: right;">
            <h3>Invoice Details:</h3>
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            <p><strong>Transaction ID:</strong> ${invoice.transactionId}</p>
          </div>
        </div>
        
        <h3>Service Details:</h3>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>${invoice.doctorName}</strong><br>
                ${invoice.doctorSpecialization || 'General Consultation'}<br>
                ${invoice.appointmentId ? `Appointment Date: ${new Date(invoice.appointmentId.appointmentDate).toLocaleString()}` : ''}
              </td>
              <td>1</td>
              <td>₹${invoice.consultationFee.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Tax (GST ${(invoice.taxRate * 100).toFixed(0)}%)</td>
              <td>-</td>
              <td>₹${invoice.tax.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="2">Total Amount</td>
              <td>₹${invoice.totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>Thank you for using MediMeal!</p>
          <p>This is an automated invoice generated by the MediMeal system.</p>
        </div>
      </body>
      </html>
    `;
    
    // Return JSON with HTML for PDF conversion
    res.status(200).json({
      success: true,
      data: {
        invoice,
        html: htmlInvoice,
        user: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice'
    });
  }
});

module.exports = router;
