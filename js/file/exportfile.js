    var element = document.querySelector("body");
    var opt = {
        margin:       1,
        filename:     'myfile.pdf',
        image:        { type: 'pdf', quality: 0.98 },
        html2canvas:  { scale: 1 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();

