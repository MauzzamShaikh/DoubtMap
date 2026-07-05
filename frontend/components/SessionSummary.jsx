import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, X, Award, BarChart2, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

function SessionSummary({ summary, onClose }) {
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    // Header styling
    doc.setFillColor(79, 70, 229); // Indigo theme
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Session Summary Report', 14, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(220, 220, 255);
    doc.text(`Lecture: ${summary.title}  |  Code: ${summary.sessionCode}`, 14, 26);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

    y = 50;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Overview', 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Count / Value']],
      body: [
        ['Total Questions Submitted', summary.totalDoubts],
        ['Resolved by Instructor', summary.resolvedCount],
        ['Unresolved Doubts', summary.unresolvedCount]
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 }
    });
    y = doc.lastAutoTable.finalY + 12;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Doubt Heatmap by Topic', 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [['Topic Area', 'Questions Logged']],
      body: summary.topicBreakdown.map((t) => [t.topic, t.count]),
      theme: 'grid',
      headStyles: { fillColor: [124, 58, 237], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 }
    });
    y = doc.lastAutoTable.finalY + 12;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Student Doubts (by Upvotes)', 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [['Question Text', 'Topic', 'Upvotes', 'Status']],
      body: summary.topDoubts.map((d) => [d.text, d.topic, d.upvotes, d.resolved ? 'Resolved' : 'Unresolved']),
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 0: { cellWidth: 100 } }
    });

    doc.save(`session-${summary.sessionCode}-summary.pdf`);
  };

  const maxCount = summary.topicBreakdown.length > 0 
    ? Math.max(...summary.topicBreakdown.map(t => t.count)) 
    : 1;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="glass-panel max-w-lg w-full p-6 md:p-8 rounded-3xl border border-slate-800/80 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-slide-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
              Session Archive
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white leading-tight">{summary.title}</h2>
          <p className="text-xs text-slate-450 mt-1">
            Session Code: <span className="font-semibold text-slate-300 uppercase tracking-widest">{summary.sessionCode}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 text-center">
            <HelpCircle className="w-5 h-5 text-indigo-400 mx-auto mb-1.5" />
            <p className="text-2xl font-extrabold text-white">{summary.totalDoubts}</p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Total</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
            <p className="text-2xl font-extrabold text-emerald-400">{summary.resolvedCount}</p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Resolved</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 text-center">
            <AlertCircle className="w-5 h-5 text-rose-450 mx-auto mb-1.5" />
            <p className="text-2xl font-extrabold text-rose-450">{summary.unresolvedCount}</p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Pending</p>
          </div>
        </div>

        {/* Topic Breakdown Progress Meters */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-3.5">
            <BarChart2 className="w-4.5 h-4.5 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Topic Distribution</h3>
          </div>

          <div className="flex flex-col gap-3.5">
            {summary.topicBreakdown.length === 0 && (
              <p className="text-sm text-slate-500 italic pl-1">No topics logged during this session.</p>
            )}
            {summary.topicBreakdown.map((t) => {
              const ratio = Math.round((t.count / maxCount) * 100);
              return (
                <div key={t.topic} className="flex flex-col gap-1.5 pl-1">
                  <div className="flex justify-between text-xs text-slate-300 font-semibold">
                    <span>{t.topic}</span>
                    <span className="text-slate-500">{t.count} doubts</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900/60 rounded-full overflow-hidden border border-slate-900">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                      style={{ width: `${ratio}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 3 Doubts */}
        <div className="mb-8">
          <div className="flex items-center gap-1.5 mb-3.5">
            <Award className="w-4.5 h-4.5 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Upvoted Doubts</h3>
          </div>

          <div className="flex flex-col gap-3 pl-1">
            {summary.topDoubts.length === 0 && (
              <p className="text-sm text-slate-500 italic">No doubts posted during this lecture.</p>
            )}
            {summary.topDoubts.map((d, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 flex flex-col gap-2.5">
                <p className="text-slate-200 text-sm leading-snug">{d.text}</p>
                <div className="flex items-center justify-between gap-2 flex-wrap border-t border-slate-950 pt-2.5">
                  <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full">
                    {d.topic}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-medium text-slate-450">
                      👍 {d.upvotes} upvotes
                    </span>
                    <span className={`text-[10px] font-bold ${d.resolved ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {d.resolved ? '✓ Resolved' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <FileText className="w-5 h-5" /> Download Summary PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-900 border border-slate-800 text-slate-350 py-3.5 rounded-2xl font-bold hover:border-slate-700 hover:text-white transition-all cursor-pointer text-sm"
          >
            Return to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}

export default SessionSummary;