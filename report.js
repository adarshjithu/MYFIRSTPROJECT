const report = async(allData,total)=>{

    return new Promise((resolve,reject)=>{
        const fs = require("fs");
        const PDFDocument = require("pdfkit-table");
      
        // init document
        let doc = new PDFDocument({ margin: 30, size: 'A4' });
        // save document
        doc.pipe(fs.createWriteStream("./document.pdf"));
        ;(async function(){
    
             // table
             const table = {
               title: '',
               subtitle:'',
               headers: [
                 { label: "productsCount", property: 'productsCount', width: 60, renderer: null },
                 { label: "Customer", property: 'customer', width: 80, renderer: null }, 
                 { label: "OrderId", property: 'orderId', width: 110, renderer: null }, 
                 { label: "Total", property: 'total', width: 100, renderer: null }, 
                 { label: "Status", property: 'status', width: 50, renderer: null }, 
                 { label: "Date", property: 'date', width: 80, renderer: null }, 
                 { label: "Payment", property: 'paymentType', width: 43, 
                 renderer:null
                 },
    
               ],
               // complex data
               datas: [
                 ...allData
               
                 // {...},
               ],
               
             };
             // the magic
             doc.table(table, {
                  prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
                  prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                       doc.font("Helvetica").fontSize(8);
                       indexColumn === 0 && doc.addBackground(rectRow, 'white', 0.15);
                  },
             });
       
             // done!
             doc.end();
           })();

           resolve()
    })
    
    
}

module.export = {report}