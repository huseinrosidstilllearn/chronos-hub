import React, { useState } from 'react';
import { 
  Plus, 
  CheckSquare, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Grid2X2, 
  Check, 
  Trash2, 
  Edit, 
  AlertCircle, 
  Clock, 
  ChevronDown, 
  ChevronRight,
  Sparkles,
  Flame,
  Calendar,
  Zap,
  Coffee,
  History,
  Award,
  TrendingUp,
  Download,
  RotateCcw,
  CheckCircle2,
  PieChart,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatDateDDMMYYYY, formatDateIndonesian } from '../utils/dateUtils';

export default function TaskManagerView({ 
  tasks, 
  categories, 
  onOpenAddModal, 
  onToggleTaskStatus, 
  onToggleSubtask, 
  onOpenEditTask, 
  onDeleteTask 
}) {
  const [layoutMode, setLayoutMode] = useState('kanban'); // 'kanban' | 'list' | 'matrix' | 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMonthYear, setSelectedMonthYear] = useState('all'); // 'all' | 'YYYY-MM'
  const [expandedTasks, setExpandedTasks] = useState({});

  const toggleExpand = (taskId) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (e) {
      console.log('Confetti triggered');
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    if (newStatus === 'done') {
      triggerCelebration();
    }
    onToggleTaskStatus(taskId, newStatus);
  };

  const getCategoryObj = (catId) => categories.find(c => c.id === catId) || { label: catId, color: '#3b82f6', bgClass: 'badge-category-work' };

  // All completed tasks
  const completedTasksAll = tasks.filter(t => t.status === 'done');

  // Extract unique Month-Years from completed tasks for the dropdown filter
  const availableMonthsMap = {};
  completedTasksAll.forEach(t => {
    const dateStr = t.completedAt || t.dueDate || t.date;
    if (dateStr) {
      const yearMonth = dateStr.substring(0, 7); // 'YYYY-MM'
      if (!availableMonthsMap[yearMonth]) {
        const [y, m] = yearMonth.split('-');
        const monthNames = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        const monthName = monthNames[parseInt(m, 10) - 1] || m;
        availableMonthsMap[yearMonth] = `${monthName} ${y}`;
      }
    }
  });

  // Filter tasks based on search, priority, category
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    return matchesSearch && matchesPriority && matchesCategory;
  });

  // Filter for Completed History View with Month Filter
  const filteredHistoryTasks = filteredTasks.filter(task => {
    if (task.status !== 'done') return false;
    if (selectedMonthYear === 'all') return true;
    const taskDate = task.completedAt || task.dueDate || task.date;
    return taskDate && taskDate.startsWith(selectedMonthYear);
  });

  // Monthly Recap Calculations
  const historyDoneCount = filteredHistoryTasks.length;
  
  let totalSubtasksDone = 0;
  let totalSubtasksAll = 0;
  filteredHistoryTasks.forEach(t => {
    if (t.subtasks && t.subtasks.length > 0) {
      totalSubtasksAll += t.subtasks.length;
      totalSubtasksDone += t.subtasks.filter(s => s.completed).length;
    }
  });

  // Category breakdown for recap
  const categoryStats = categories.map(cat => {
    const count = filteredHistoryTasks.filter(t => t.category === cat.id).length;
    return { ...cat, count };
  });

  const topCategory = [...categoryStats].sort((a, b) => b.count - a.count)[0];

  // Priority breakdown for recap
  const priorityCounts = {
    urgent: filteredHistoryTasks.filter(t => t.priority === 'urgent').length,
    high: filteredHistoryTasks.filter(t => t.priority === 'high').length,
    medium: filteredHistoryTasks.filter(t => t.priority === 'medium').length,
    low: filteredHistoryTasks.filter(t => t.priority === 'low').length,
  };

  // Helper format completion time string
  const formatCompletedTime = (dateStr) => {
    if (!dateStr) return 'Telah Diselesaikan';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate().toString().padStart(2, '0');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const monthStr = monthNames[d.getMonth()];
      const year = d.getFullYear();
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      return `${day} ${monthStr} ${year}, ${hours}:${mins} WIB`;
    } catch (e) {
      return dateStr;
    }
  };

  // Export Rekapan Bulanan CSV
  const handleExportCSV = () => {
    if (filteredHistoryTasks.length === 0) {
      alert('Tidak ada data riwayat tugas selesai untuk di-export pada filter saat ini.');
      return;
    }

    const monthLabel = selectedMonthYear === 'all' 
      ? 'Semua Waktu' 
      : (availableMonthsMap[selectedMonthYear] || selectedMonthYear);

    let csvContent = `\uFEFFRekapan Riwayat Tugas Selesai - Chronos Hub\n`;
    csvContent += `Periode: ${monthLabel}\n`;
    csvContent += `Tanggal Export: ${new Date().toLocaleDateString('id-ID')}\n\n`;
    csvContent += `Judul Tugas,Kategori,Prioritas,Tanggal Selesai,Tenggat Waktu,Sub-Tugas Selesai,Catatan\n`;

    filteredHistoryTasks.forEach(t => {
      const catObj = getCategoryObj(t.category);
      const subDone = t.subtasks ? t.subtasks.filter(s => s.completed).length : 0;
      const subTotal = t.subtasks ? t.subtasks.length : 0;
      const subStr = subTotal > 0 ? `"${subDone}/${subTotal}"` : '"-"';
      const cleanTitle = `"${(t.title || '').replace(/"/g, '""')}"`;
      const cleanNotes = `"${(t.notes || '').replace(/"/g, '""')}"`;
      const completedTime = `"${formatCompletedTime(t.completedAt)}"`;
      const dueDateStr = `"${t.dueDate || '-'}"`;

      csvContent += `${cleanTitle},"${catObj.label}","${t.priority.toUpperCase()}",${completedTime},${dueDateStr},${subStr},${cleanNotes}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekapan_Tugas_Selesai_${selectedMonthYear === 'all' ? 'Semua_Waktu' : selectedMonthYear}.csv`;
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Task Manager Toolbar Header */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.2rem 0' }}>
              Manajemen Tugas & Prioritas
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Atur daftar tugas dengan Kanban, Matriks Prioritas, dan simpan permanen ke Riwayat & Rekapan Bulanan.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            
            {/* View Layout Switcher (Kanban, List, Matrix, History & Recap) */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setLayoutMode('kanban')} 
                className={`btn btn-sm ${layoutMode === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: 'none' }}
                title="Papan Kanban"
              >
                <LayoutGrid size={15} /> Papan Kanban
              </button>
              
              <button 
                onClick={() => setLayoutMode('list')} 
                className={`btn btn-sm ${layoutMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: 'none' }}
                title="Daftar List"
              >
                <List size={15} /> List
              </button>

              <button 
                onClick={() => setLayoutMode('matrix')} 
                className={`btn btn-sm ${layoutMode === 'matrix' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: 'none' }}
                title="Eisenhower Matrix"
              >
                <Grid2X2 size={15} /> Matriks Eisenhower
              </button>

              <button 
                onClick={() => setLayoutMode('history')} 
                className={`btn btn-sm ${layoutMode === 'history' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: 'none', background: layoutMode === 'history' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent', color: '#fff' }}
                title="Riwayat & Rekapan Tugas Selesai"
              >
                <History size={15} /> Riwayat & Rekapan
                {completedTasksAll.length > 0 && (
                  <span style={{
                    background: layoutMode === 'history' ? '#ffffff' : '#10b981',
                    color: layoutMode === 'history' ? '#059669' : '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '999px',
                    marginLeft: '5px'
                  }}>
                    {completedTasksAll.length}
                  </span>
                )}
              </button>
            </div>

            <button onClick={() => onOpenAddModal('task')} className="btn btn-primary">
              <Plus size={16} /> Tugas Baru
            </button>

          </div>

        </div>

        {/* Search & Filters Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Cari tugas atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.3rem' }}
            />
          </div>

          {/* Priority Filter */}
          <select 
            value={selectedPriority} 
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="select-field"
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="all">Semua Prioritas</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          {/* Category Filter */}
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select-field"
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="all">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

        </div>
      </div>

      {/* Mode 1: KANBAN BOARD VIEW */}
      {layoutMode === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {/* Column 1: To Do */}
          <KanbanColumn 
            title="BELUM DIMULAI (TO DO)"
            status="to-do"
            badgeColor="var(--status-high)"
            tasks={filteredTasks.filter(t => t.status === 'to-do')}
            getCategoryObj={getCategoryObj}
            onStatusChange={handleStatusChange}
            onToggleSubtask={onToggleSubtask}
            onOpenEditTask={onOpenEditTask}
            onDeleteTask={onDeleteTask}
            expandedTasks={expandedTasks}
            toggleExpand={toggleExpand}
          />

          {/* Column 2: In Progress */}
          <KanbanColumn 
            title="SEDANG DIKERJAKAN (IN PROGRESS)"
            status="in-progress"
            badgeColor="var(--category-work)"
            tasks={filteredTasks.filter(t => t.status === 'in-progress')}
            getCategoryObj={getCategoryObj}
            onStatusChange={handleStatusChange}
            onToggleSubtask={onToggleSubtask}
            onOpenEditTask={onOpenEditTask}
            onDeleteTask={onDeleteTask}
            expandedTasks={expandedTasks}
            toggleExpand={toggleExpand}
          />

          {/* Column 3: Done */}
          <KanbanColumn 
            title="SELESAI (DONE)"
            status="done"
            badgeColor="var(--status-low)"
            tasks={filteredTasks.filter(t => t.status === 'done')}
            getCategoryObj={getCategoryObj}
            onStatusChange={handleStatusChange}
            onToggleSubtask={onToggleSubtask}
            onOpenEditTask={onOpenEditTask}
            onDeleteTask={onDeleteTask}
            expandedTasks={expandedTasks}
            toggleExpand={toggleExpand}
            onOpenHistory={() => setLayoutMode('history')}
          />

        </div>
      )}

      {/* Mode 2: TASK LIST VIEW */}
      {layoutMode === 'list' && (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              Tidak ada tugas yang sesuai dengan filter pencarian.
            </div>
          ) : (
            filteredTasks.map(task => {
              const catObj = getCategoryObj(task.category);
              const subtasksCount = task.subtasks ? task.subtasks.length : 0;
              const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
              const isExpanded = expandedTasks[task.id];

              return (
                <div 
                  key={task.id} 
                  className="glass-panel"
                  style={{ 
                    padding: '1rem', 
                    background: task.status === 'done' ? 'rgba(0,0,0,0.3)' : 'rgba(18, 26, 45, 0.65)',
                    borderLeft: `4px solid ${catObj.color}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
                      <button 
                        onClick={() => handleStatusChange(task.id, task.status === 'done' ? 'to-do' : 'done')}
                        style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '6px', 
                          border: task.status === 'done' ? 'none' : '2px solid var(--border-color)',
                          background: task.status === 'done' ? 'var(--status-low)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        {task.status === 'done' && <Check size={16} color="#fff" />}
                      </button>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <h4 style={{ 
                            fontSize: '1.05rem', 
                            fontWeight: 700, 
                            margin: 0,
                            textDecoration: task.status === 'done' ? 'line-through' : 'none',
                            color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-main)'
                          }}>
                            {task.title}
                          </h4>
                          <span className={`badge ${catObj.bgClass}`}>
                            {catObj.label}
                          </span>
                          <span className={`badge badge-${task.priority}`}>
                            {task.priority.toUpperCase()}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {task.dueDate && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Clock size={13} color="var(--accent-light)" />
                              Tenggat: {formatDateDDMMYYYY(task.dueDate)} {task.dueTime ? `(${task.dueTime} WIB)` : ''}
                            </span>
                          )}
                          {subtasksCount > 0 && (
                            <span>Sub-tugas: {completedSubtasks}/{subtasksCount}</span>
                          )}
                          {task.completedAt && (
                            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <CheckCircle2 size={13} /> Selesai: {formatCompletedTime(task.completedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {subtasksCount > 0 && (
                        <button 
                          onClick={() => toggleExpand(task.id)}
                          className="btn btn-secondary btn-sm"
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          Sub-tugas ({completedSubtasks}/{subtasksCount})
                        </button>
                      )}
                      <button onClick={() => onOpenEditTask(task)} className="btn btn-secondary btn-sm">
                        <Edit size={14} /> Edit
                      </button>
                      <button onClick={() => onDeleteTask(task.id)} className="btn btn-secondary btn-sm" style={{ color: '#f87171' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>

                  </div>

                  {/* Expanded Subtasks List */}
                  {isExpanded && subtasksCount > 0 && (
                    <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)', paddingLeft: '2.5rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        CHECKLIST SUB-TUGAS:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {task.subtasks.map(sub => (
                          <div 
                            key={sub.id} 
                            onClick={() => onToggleSubtask(task.id, sub.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem' }}
                          >
                            <div style={{ 
                              width: '18px', 
                              height: '18px', 
                              borderRadius: '4px', 
                              border: sub.completed ? 'none' : '1px solid var(--border-color)',
                              background: sub.completed ? 'var(--accent-primary)' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {sub.completed && <Check size={12} color="#fff" />}
                            </div>
                            <span style={{ textDecoration: sub.completed ? 'line-through' : 'none', color: sub.completed ? 'var(--text-muted)' : 'var(--text-main)' }}>
                              {sub.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      )}

      {/* Mode 3: EISENHOWER MATRIX VIEW */}
      {layoutMode === 'matrix' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          
          {/* Quadrant 1: Urgent & Important */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderTop: '4px solid var(--status-urgent)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f87171', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Flame size={18} color="#f87171" /> URGENT & PENTING (Lakukan Sekarang)
            </h3>
            <MatrixTaskList 
              tasks={filteredTasks.filter(t => t.priority === 'urgent' && t.status !== 'done')}
              onStatusChange={handleStatusChange}
              onOpenEditTask={onOpenEditTask}
            />
          </div>

          {/* Quadrant 2: Important Not Urgent */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderTop: '4px solid var(--status-high)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fb923c', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Calendar size={18} color="#fb923c" /> PENTING TAPI TDK URGENT (Jadwalkan Waktu)
            </h3>
            <MatrixTaskList 
              tasks={filteredTasks.filter(t => t.priority === 'high' && t.status !== 'done')}
              onStatusChange={handleStatusChange}
              onOpenEditTask={onOpenEditTask}
            />
          </div>

          {/* Quadrant 3: Urgent Not Important */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderTop: '4px solid var(--status-medium)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#facc15', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Zap size={18} color="#facc15" /> URGENT TAPI TDK PENTING (Delegasikan)
            </h3>
            <MatrixTaskList 
              tasks={filteredTasks.filter(t => t.priority === 'medium' && t.status !== 'done')}
              onStatusChange={handleStatusChange}
              onOpenEditTask={onOpenEditTask}
            />
          </div>

          {/* Quadrant 4: Neither Urgent nor Important */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderTop: '4px solid var(--status-low)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Coffee size={18} color="#34d399" /> TIDAK URGENT & TIDAK PENTING (Eliminasi/Hobi)
            </h3>
            <MatrixTaskList 
              tasks={filteredTasks.filter(t => t.priority === 'low' && t.status !== 'done')}
              onStatusChange={handleStatusChange}
              onOpenEditTask={onOpenEditTask}
            />
          </div>

        </div>
      )}

      {/* Mode 4: RIWAYAT & REKAPAN BULANAN TUGAS (TASK HISTORY & MONTHLY RECAP) */}
      {layoutMode === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Header Controls & Filter Month */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '0.55rem', borderRadius: '10px', display: 'flex' }}>
                  <History size={24} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                    📜 Riwayat & Rekapan Bulanan Tugas Selesai
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                    Semua tugas yang telah diselesaikan tersimpan permanen di sini untuk arsip & rekapan produktivitas.
                  </p>
                </div>
              </div>

              {/* Month Selector & Export CSV Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={16} color="var(--accent-light)" />
                  <select 
                    value={selectedMonthYear}
                    onChange={(e) => setSelectedMonthYear(e.target.value)}
                    className="select-field"
                    style={{ minWidth: '170px', fontSize: '0.85rem', padding: '0.4rem 0.65rem', fontWeight: 700 }}
                  >
                    <option value="all">📅 Semua Bulan (All Time)</option>
                    {Object.keys(availableMonthsMap).sort().reverse().map(ym => (
                      <option key={ym} value={ym}>🗓️ {availableMonthsMap[ym]}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={handleExportCSV}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: '#10b981', color: '#34d399', fontWeight: 700 }}
                >
                  <Download size={15} /> Export Rekapan CSV
                </button>

              </div>

            </div>
          </div>

          {/* 4 KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            
            {/* KPI 1 */}
            <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  TOTAL SELESAI
                </span>
                <Award size={20} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                {historyDoneCount} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tugas</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#34d399', display: 'block', marginTop: '2px' }}>
                {selectedMonthYear === 'all' ? 'Arsip Keseluruhan' : `Bulan ${availableMonthsMap[selectedMonthYear] || selectedMonthYear}`}
              </span>
            </div>

            {/* KPI 2 */}
            <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  SUB-TUGAS CHECKLIST
                </span>
                <CheckCircle2 size={20} color="#3b82f6" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                {totalSubtasksDone} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>/ {totalSubtasksAll} Selesai</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-light)', display: 'block', marginTop: '2px' }}>
                {totalSubtasksAll > 0 ? `${Math.round((totalSubtasksDone / totalSubtasksAll) * 100)}% Kelengkapan Checklist` : 'Tidak ada sub-tugas'}
              </span>
            </div>

            {/* KPI 3 */}
            <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  KATEGORI TERAKTIF
                </span>
                <PieChart size={20} color="#a78bfa" />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {topCategory && topCategory.count > 0 ? topCategory.label : '-'}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#a78bfa', display: 'block', marginTop: '2px' }}>
                {topCategory && topCategory.count > 0 ? `${topCategory.count} Tugas Selesai` : 'Belum ada data'}
              </span>
            </div>

            {/* KPI 4 */}
            <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderLeft: '4px solid #f87171' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  URGENT & HIGH SELESAI
                </span>
                <Flame size={20} color="#f87171" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                {priorityCounts.urgent + priorityCounts.high} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tugas</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#f87171', display: 'block', marginTop: '2px' }}>
                {priorityCounts.urgent} Urgent • {priorityCounts.high} High Priority
              </span>
            </div>

          </div>

          {/* Category & Priority Progress Breakdown Visuals */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            
            {/* Category Breakdown */}
            <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-secondary)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BarChart3 size={18} color="var(--accent-light)" /> REKAPAN PER KATEGORI
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {categoryStats.map(cat => {
                  const percent = historyDoneCount > 0 ? Math.round((cat.count / historyDoneCount) * 100) : 0;
                  return (
                    <div key={cat.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
                        <span style={{ color: '#fff' }}>{cat.label}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{cat.count} Tugas ({percent}%)</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: cat.color, borderRadius: '3px', transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority Breakdown */}
            <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-secondary)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <PieChart size={18} color="#facc15" /> REKAPAN PER PRIORITAS
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', display: 'block' }}>🔴 URGENT</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{priorityCounts.urgent}</span>
                </div>

                <div style={{ background: 'rgba(249, 115, 22, 0.12)', border: '1px solid rgba(249, 115, 22, 0.3)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fb923c', display: 'block' }}>🟠 HIGH</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{priorityCounts.high}</span>
                </div>

                <div style={{ background: 'rgba(234, 179, 8, 0.12)', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#facc15', display: 'block' }}>🟡 MEDIUM</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{priorityCounts.medium}</span>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', display: 'block' }}>🟢 LOW</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{priorityCounts.low}</span>
                </div>
              </div>
            </div>

          </div>

          {/* List of Completed History Tasks */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} color="#10b981" /> LOG DAFTAR RIWAYAT TUGAS SELESAI ({filteredHistoryTasks.length})
              </h3>
            </div>

            {filteredHistoryTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <History size={36} color="var(--text-dim)" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.9rem', margin: 0 }}>
                  Belum ada tugas selesai pada periode ini.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filteredHistoryTasks.map(task => {
                  const catObj = getCategoryObj(task.category);
                  const subtasksCount = task.subtasks ? task.subtasks.length : 0;
                  const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
                  const isExpanded = expandedTasks[task.id];

                  return (
                    <div 
                      key={task.id}
                      className="glass-panel"
                      style={{
                        padding: '1rem 1.25rem',
                        background: 'rgba(10, 16, 30, 0.75)',
                        borderLeft: `4px solid ${catObj.color}`,
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                        
                        <div style={{ flex: 1, minWidth: '240px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                            <span className="badge badge-low" style={{ background: '#059669', color: '#fff', fontWeight: 800 }}>
                              ✓ SELESAI
                            </span>
                            <span className={`badge ${catObj.bgClass}`}>
                              {catObj.label}
                            </span>
                            <span className={`badge badge-${task.priority}`}>
                              {task.priority.toUpperCase()}
                            </span>
                          </div>

                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.3rem 0', color: '#fff' }}>
                            {task.title}
                          </h4>

                          {task.notes && (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0', lineHeight: 1.35 }}>
                              {task.notes}
                            </p>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            <span style={{ color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <CheckCircle2 size={13} /> Selesai: {formatCompletedTime(task.completedAt)}
                            </span>

                            {task.dueDate && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Clock size={13} /> Tenggat awal: {formatDateDDMMYYYY(task.dueDate)}
                              </span>
                            )}

                            {subtasksCount > 0 && (
                              <span style={{ fontWeight: 600 }}>Checklist: {completedSubtasks}/{subtasksCount} Selesai</span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button 
                            onClick={() => handleStatusChange(task.id, 'to-do')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', gap: '0.3rem' }}
                            title="Kembalikan tugas ke daftar Belum Selesai (To-Do)"
                          >
                            <RotateCcw size={13} color="var(--accent-light)" /> Kembalikan ke To-Do
                          </button>
                          
                          <button onClick={() => onOpenEditTask(task)} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }} title="Edit Tugas">
                            <Edit size={14} />
                          </button>

                          <button onClick={() => onDeleteTask(task.id)} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px', color: '#f87171' }} title="Hapus dari Riwayat">
                            <Trash2 size={14} />
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

// Sub-component for Kanban Column
function KanbanColumn({ 
  title, 
  status, 
  badgeColor, 
  tasks, 
  getCategoryObj, 
  onStatusChange, 
  onToggleSubtask, 
  onOpenEditTask, 
  onDeleteTask,
  expandedTasks,
  toggleExpand,
  onOpenHistory
}) {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '500px' }}>
      <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.04em', margin: 0, color: 'var(--text-main)' }}>
            {title}
          </h3>
          <span style={{ background: badgeColor, color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '999px' }}>
            {tasks.length}
          </span>
        </div>

        {status === 'done' && onOpenHistory && (
          <button 
            onClick={onOpenHistory}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.72rem', padding: '3px 8px', marginTop: '6px', width: '100%', justifyContent: 'center', borderColor: '#10b981', color: '#34d399' }}
          >
            <History size={12} /> Buka Riwayat & Rekapan Bulanan
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            Tidak ada tugas di kolom ini.
          </div>
        ) : (
          tasks.map(task => {
            const catObj = getCategoryObj(task.category);
            const subtasksCount = task.subtasks ? task.subtasks.length : 0;
            const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
            const isExpanded = expandedTasks[task.id];

            return (
              <div 
                key={task.id} 
                className="glass-panel glass-panel-hover"
                style={{ 
                  padding: '1rem', 
                  background: 'rgba(15, 22, 38, 0.75)',
                  borderLeft: `4px solid ${catObj.color}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className={`badge ${catObj.bgClass}`} style={{ fontSize: '0.7rem' }}>
                    {catObj.label}
                  </span>
                  <span className={`badge badge-${task.priority}`} style={{ fontSize: '0.68rem' }}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>

                <h4 
                  onClick={() => onOpenEditTask(task)}
                  style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: 'var(--text-main)', cursor: 'pointer' }}
                >
                  {task.title}
                </h4>

                {task.notes && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>
                    {task.notes}
                  </p>
                )}

                {/* Subtask Progress Indicator */}
                {subtasksCount > 0 && (
                  <div style={{ margin: '0.5rem 0' }}>
                    <div 
                      onClick={() => toggleExpand(task.id)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '4px' }}
                    >
                      <span>Checklist ({completedSubtasks}/{subtasksCount})</span>
                      {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </div>
                    <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${(completedSubtasks / subtasksCount) * 100}%`, height: '100%', background: 'var(--accent-primary)' }} />
                    </div>

                    {isExpanded && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem' }}>
                        {task.subtasks.map(s => (
                          <div 
                            key={s.id}
                            onClick={() => onToggleSubtask(task.id, s.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}
                          >
                            <div style={{ width: '14px', height: '14px', borderRadius: '3px', border: s.completed ? 'none' : '1px solid var(--border-color)', background: s.completed ? 'var(--accent-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {s.completed && <Check size={10} color="#fff" />}
                            </div>
                            <span style={{ textDecoration: s.completed ? 'line-through' : 'none', color: s.completed ? 'var(--text-muted)' : 'var(--text-main)' }}>
                              {s.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Status Switch Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {status !== 'to-do' && (
                      <button onClick={() => onStatusChange(task.id, 'to-do')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                        ← To Do
                      </button>
                    )}
                    {status !== 'in-progress' && (
                      <button onClick={() => onStatusChange(task.id, 'in-progress')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                        In Progress
                      </button>
                    )}
                    {status !== 'done' && (
                      <button onClick={() => onStatusChange(task.id, 'done')} className="btn btn-primary btn-sm" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                        ✓ Done
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                    <button onClick={() => onOpenEditTask(task)} className="btn btn-secondary btn-icon" style={{ width: '26px', height: '26px' }}>
                      <Edit size={13} />
                    </button>
                    <button onClick={() => onDeleteTask(task.id)} className="btn btn-secondary btn-icon" style={{ width: '26px', height: '26px', color: '#f87171' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function MatrixTaskList({ tasks, onStatusChange, onOpenEditTask }) {
  if (tasks.length === 0) {
    return <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>Kosong</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {tasks.map(t => (
        <div key={t.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem 0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{t.title}</span>
          <button onClick={() => onStatusChange(t.id, 'done')} className="btn btn-primary btn-sm" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>
            ✓ Selesai
          </button>
        </div>
      ))}
    </div>
  );
}
