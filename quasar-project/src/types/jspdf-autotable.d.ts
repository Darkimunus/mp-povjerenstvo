//da se ne javljaju typescript greške vezane uz lastAutoTable

import 'jspdf';

declare module 'jspdf' {
    interface jsPDF {
        lastAutoTable?:{
            finalY: number;
            startY: number;
        }
    } //interface zagrada
} //declare zagrada

declare module 'jspdf-autotable';