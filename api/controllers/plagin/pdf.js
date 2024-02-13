const { performDatabaseOperations } = require('../connection/tokens')

// ------------------------------------------------------------------------------
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');

async function addTextToPdf(sourcePdfPath, outputPath, texts) {
  // Load the existing PDF document
  const existingPdfBytes = fs.readFileSync(sourcePdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // Get the first page of the document
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Set the font size
  const fontSize = 12;

  // Draw each piece of text on the page at the specified coordinates
  texts.forEach(text => {
    firstPage.drawText(text.content, {
      x: text.x,
      y: text.y,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
  });

  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save()

  // Write the new PDF to a file
  fs.writeFileSync(outputPath, pdfBytes);
}

// יצירת רשומה בודדת
const createPDFconsular2 = (req, res) => {
console.log(req.body)
  const fieldsToPlace = [
    { fieldName: 'Serial Number', content: '12345', x: 255, y: 705 },
    { fieldName: 'date', content: '31/12/2023', x: 35, y: 690 },
    { fieldName: 'Attention', content: 'Recipient Name', x: 120, y: 639 },
    { fieldName: 'Deceased Name', content: 'Deceased Name', x: 182, y: 511 },
    { fieldName: 'Block', content: '3', x: 125, y: 470 },
    { fieldName: 'Plot', content: '2A', x: 118, y: 448 },
    { fieldName: 'Row', content: '6', x: 128, y: 428 },
    { fieldName: 'Grave', content: '9', x: 120, y: 407 },
    { fieldName: 'Cemetery', content: 'Cemetery Name', x: 117, y: 385 },
    { fieldName: 'Deed', content: '123456', x: 180, y: 343 }
  ]

  addTextToPdf('./empty.PDF', './אישור קונסולרי ' + '' + '.pdf', fieldsToPlace)
    .then(() => {
      // קרא את ה-PDF שנוצר ושלח אותו חזרה
      const pdfBytes = fs.readFileSync('./filled_form.pdf');
      res.status(200).send(pdfBytes);
    })
    .catch(error => {
      console.error('Failed to add text to PDF', error);
      res.status(500).send('Failed to add text to PDF');
    })
}

const createPDFconsular = async (req, res) => {
  console.log(req.body)
  const fieldsToPlace = req.body; // Assuming this is sent in the request

  try {
    await addTextToPdf('./api/documents/consulars/ConsularApprovalEmpty.PDF', './api/documents/consulars/ConsularApproval' + req.body[0].content + '.pdf', fieldsToPlace);
    const pdfBytes = fs.readFileSync('./api/documents/consulars/ConsularApproval' + req.body[0].content + '.pdf');
    res.status(200).send(pdfBytes);
  } catch (error) {
    console.error('Failed to add text to PDF', error);
    res.status(500).send('Failed to add text to PDF');
  }
}


module.exports = {
  createPDFconsular
}