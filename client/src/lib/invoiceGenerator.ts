import jsPDF from 'jspdf';
import { formatCurrency, formatDate, getFullName } from './utils';

interface InvoiceData {
  jobTitle: string;
  jobId: number;
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
  datePaid: Date;
  carOwner: {
    firstName: string;
    lastName: string;
    email: string;
  };
  mechanic: {
    firstName: string;
    lastName: string;
    email: string;
  };
  vehicle: string;
  location: string;
}

export const generateInvoicePDF = (invoiceData: InvoiceData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const primaryColor = '#2563eb'; // Blue
  const secondaryColor = '#64748b'; // Gray
  const accentColor = '#059669'; // Green
  
  // Header
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT INVOICE', 20, 20);
  
  // Invoice number and date
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: INV-${invoiceData.jobId}-${Date.now().toString().slice(-6)}`, pageWidth - 60, 45);
  doc.text(`Date: ${formatDate(invoiceData.datePaid)}`, pageWidth - 60, 52);
  
  // Company info (left side)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Mechanic Finder Platform', 20, 45);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Auto Repair Marketplace', 20, 52);
  doc.text('Connecting Car Owners with Mechanics', 20, 57);
  
  // Bill To section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 20, 75);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(getFullName(invoiceData.carOwner.firstName, invoiceData.carOwner.lastName), 20, 83);
  doc.text(invoiceData.carOwner.email, 20, 88);
  
  // Service Provider section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SERVICE PROVIDED BY:', pageWidth - 100, 75);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(getFullName(invoiceData.mechanic.firstName, invoiceData.mechanic.lastName), pageWidth - 100, 83);
  doc.text(invoiceData.mechanic.email, pageWidth - 100, 88);
  
  // Job Details section
  doc.setFillColor(248, 250, 252); // Light gray background
  doc.rect(15, 100, pageWidth - 30, 50, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('JOB DETAILS', 20, 112);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Job Title: ${invoiceData.jobTitle}`, 20, 120);
  doc.text(`Vehicle: ${invoiceData.vehicle}`, 20, 127);
  doc.text(`Location: ${invoiceData.location}`, 20, 134);
  doc.text(`Job ID: #${invoiceData.jobId}`, 20, 141);
  
  // Payment Details Table
  const tableStartY = 165;
  
  // Table header
  doc.setFillColor(primaryColor);
  doc.rect(15, tableStartY, pageWidth - 30, 15, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT DETAILS', 20, tableStartY + 10);
  
  // Table content
  doc.setFillColor(255, 255, 255);
  doc.rect(15, tableStartY + 15, pageWidth - 30, 40, 'F');
  doc.rect(15, tableStartY, pageWidth - 30, 55, 'S'); // Border
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Payment details rows
  doc.text('Service Amount:', 20, tableStartY + 25);
  doc.text(formatCurrency(invoiceData.amount), pageWidth - 50, tableStartY + 25);
  
  doc.text('Payment Method:', 20, tableStartY + 35);
  doc.text(invoiceData.paymentMethod.toUpperCase(), pageWidth - 50, tableStartY + 35);
  
  if (invoiceData.transactionReference) {
    doc.text('Transaction Reference:', 20, tableStartY + 45);
    doc.text(invoiceData.transactionReference, pageWidth - 80, tableStartY + 45);
  }
  
  // Total section
  doc.setFillColor(accentColor);
  doc.rect(15, tableStartY + 55, pageWidth - 30, 15, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL PAID:', 20, tableStartY + 65);
  doc.text(formatCurrency(invoiceData.amount), pageWidth - 50, tableStartY + 65);
  
  // Footer
  doc.setTextColor(secondaryColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for using Mechanic Finder!', 20, pageHeight - 30);
  doc.text('This is a computer-generated invoice and does not require a signature.', 20, pageHeight - 25);
  doc.text(`Generated on ${formatDate(new Date())}`, 20, pageHeight - 20);
  
  // Status stamp
  doc.setTextColor(accentColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PAID', pageWidth - 40, tableStartY + 30);
  
  // Add border around PAID stamp
  doc.setDrawColor(accentColor);
  doc.setLineWidth(2);
  doc.rect(pageWidth - 50, tableStartY + 20, 25, 15, 'S');
  
  // Save the PDF
  const fileName = `invoice-job-${invoiceData.jobId}-${Date.now()}.pdf`;
  doc.save(fileName);
};

export const generateTransactionReceipt = (transactionData: any, jobData: any, mechanicData: any): void => {
  const invoiceData: InvoiceData = {
    jobTitle: jobData.title,
    jobId: jobData.id,
    amount: transactionData.amount,
    paymentMethod: transactionData.paymentMethod,
    transactionReference: transactionData.transactionReference,
    datePaid: new Date(transactionData.createdAt),
    carOwner: {
      firstName: jobData.user.firstName,
      lastName: jobData.user.lastName,
      email: jobData.user.email,
    },
    mechanic: {
      firstName: mechanicData.firstName,
      lastName: mechanicData.lastName,
      email: mechanicData.email,
    },
    vehicle: jobData.vehicle,
    location: jobData.location,
  };
  
  generateInvoicePDF(invoiceData);
};