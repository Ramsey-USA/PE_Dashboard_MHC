// Dashboard Application
class ProjectEngineerDashboard {
    constructor() {
        this.data = {
            rfis: JSON.parse(localStorage.getItem('rfis')) || [],
            submittals: JSON.parse(localStorage.getItem('submittals')) || [],
            timeEntries: JSON.parse(localStorage.getItem('timeEntries')) || [],
            orders: JSON.parse(localStorage.getItem('orders')) || [],
            punchItems: JSON.parse(localStorage.getItem('punchItems')) || [],
            dailyEntries: JSON.parse(localStorage.getItem('dailyEntries')) || [],
            files: JSON.parse(localStorage.getItem('files')) || []
        };
        
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCurrentDate();
        this.updateDashboardStats();
        this.renderDashboard();
        this.loadSectionData();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('.nav-link').dataset.section;
                this.showSection(section);
            });
        });

        // File upload
        const fileInput = document.getElementById('fileInput');
        const fileUploadArea = document.getElementById('fileUploadArea');
        
        fileUploadArea.addEventListener('click', () => fileInput.click());
        fileUploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        fileUploadArea.addEventListener('drop', this.handleFileDrop.bind(this));
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Form submissions
        this.setupFormListeners();
        
        // Modal and report generation
        document.getElementById('generateReport').addEventListener('click', this.generateEndOfDayReport.bind(this));
        document.getElementById('closeModal').addEventListener('click', this.closeModal.bind(this));
        document.getElementById('copyReportBtn').addEventListener('click', this.copyReportToClipboard.bind(this));
        document.getElementById('emailReportBtn').addEventListener('click', this.emailReport.bind(this));

        // Window click to close modal
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('reportModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    setupFormListeners() {
        // RFI Form
        document.getElementById('createRfiBtn').addEventListener('click', () => this.showForm('rfiForm'));
        document.getElementById('cancelRfiBtn').addEventListener('click', () => this.hideForm('rfiForm'));
        document.getElementById('rfiFormElement').addEventListener('submit', this.handleRfiSubmit.bind(this));

        // Submittal Form
        document.getElementById('createSubmittalBtn').addEventListener('click', () => this.showForm('submittalForm'));
        document.getElementById('cancelSubmittalBtn').addEventListener('click', () => this.hideForm('submittalForm'));
        document.getElementById('submittalFormElement').addEventListener('submit', this.handleSubmittalSubmit.bind(this));

        // Time Entry Form
        document.getElementById('createTimeEntryBtn').addEventListener('click', () => this.showForm('timeEntryForm'));
        document.getElementById('cancelTimeEntryBtn').addEventListener('click', () => this.hideForm('timeEntryForm'));
        document.getElementById('timeEntryFormElement').addEventListener('submit', this.handleTimeEntrySubmit.bind(this));

        // Order Form
        document.getElementById('createOrderBtn').addEventListener('click', () => this.showForm('orderForm'));
        document.getElementById('cancelOrderBtn').addEventListener('click', () => this.hideForm('orderForm'));
        document.getElementById('orderFormElement').addEventListener('submit', this.handleOrderSubmit.bind(this));

        // Punch List Form
        document.getElementById('createPunchItemBtn').addEventListener('click', () => this.showForm('punchForm'));
        document.getElementById('cancelPunchBtn').addEventListener('click', () => this.hideForm('punchForm'));
        document.getElementById('punchFormElement').addEventListener('submit', this.handlePunchSubmit.bind(this));

        // Daily Entry Form
        document.getElementById('createDailyEntryBtn').addEventListener('click', () => this.showForm('dailyEntryForm'));
        document.getElementById('cancelDailyEntryBtn').addEventListener('click', () => this.hideForm('dailyEntryForm'));
        document.getElementById('dailyEntryFormElement').addEventListener('submit', this.handleDailyEntrySubmit.bind(this));

        // File actions
        document.getElementById('compareFilesBtn').addEventListener('click', this.compareFiles.bind(this));
        document.getElementById('analyzeFileBtn').addEventListener('click', this.analyzeFile.bind(this));
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Show selected section
        document.getElementById(sectionName).classList.add('active');
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        
        this.currentSection = sectionName;
        this.loadSectionData();
    }

    loadSectionData() {
        switch(this.currentSection) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'files':
                this.renderFileList();
                break;
            case 'rfis':
                this.renderRfiTable();
                break;
            case 'submittals':
                this.renderSubmittalTable();
                break;
            case 'time-materials':
                this.renderTimeTable();
                break;
            case 'vendor-orders':
                this.renderOrderTable();
                break;
            case 'punch-list':
                this.renderPunchTable();
                break;
            case 'daily-entries':
                this.renderDailyEntries();
                break;
        }
    }

    updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
    }

    updateDashboardStats() {
        document.getElementById('rfiCount').textContent = this.data.rfis.filter(rfi => rfi.status !== 'completed').length;
        document.getElementById('submittalCount').textContent = this.data.submittals.filter(sub => sub.status !== 'approved').length;
        document.getElementById('orderCount').textContent = this.data.orders.filter(order => order.status !== 'delivered').length;
        document.getElementById('punchCount').textContent = this.data.punchItems.filter(item => item.status !== 'completed').length;
    }

    renderDashboard() {
        this.renderRecentActivity();
        this.renderUpcomingDeadlines();
        this.updateDashboardStats();
    }

    renderRecentActivity() {
        const container = document.getElementById('recentActivity');
        const allActivities = [];

        // Collect recent activities from all data sources
        this.data.rfis.slice(-5).forEach(rfi => {
            allActivities.push({
                type: 'RFI',
                description: `RFI ${rfi.number}: ${rfi.subject}`,
                date: new Date(rfi.date),
                icon: 'fas fa-question-circle'
            });
        });

        this.data.submittals.slice(-5).forEach(submittal => {
            allActivities.push({
                type: 'Submittal',
                description: `Submittal ${submittal.number}: ${submittal.title}`,
                date: new Date(submittal.date),
                icon: 'fas fa-upload'
            });
        });

        this.data.dailyEntries.slice(-5).forEach(entry => {
            allActivities.push({
                type: 'Daily Entry',
                description: `Daily entry for ${entry.date}`,
                date: new Date(entry.date),
                icon: 'fas fa-calendar-day'
            });
        });

        // Sort by date and take most recent
        allActivities.sort((a, b) => b.date - a.date);
        const recentActivities = allActivities.slice(0, 10);

        if (recentActivities.length === 0) {
            container.innerHTML = '<div class="activity-item">No recent activity</div>';
            return;
        }

        container.innerHTML = recentActivities.map(activity => `
            <div class="activity-item">
                <i class="${activity.icon}"></i>
                <span>${activity.description}</span>
                <small>${this.formatDate(activity.date)}</small>
            </div>
        `).join('');
    }

    renderUpcomingDeadlines() {
        const container = document.getElementById('upcomingDeadlines');
        const deadlines = [];

        // Collect upcoming deadlines
        this.data.rfis.forEach(rfi => {
            if (rfi.dueDate && rfi.status !== 'completed') {
                deadlines.push({
                    type: 'RFI',
                    description: `RFI ${rfi.number}: ${rfi.subject}`,
                    dueDate: new Date(rfi.dueDate),
                    priority: rfi.priority
                });
            }
        });

        this.data.submittals.forEach(submittal => {
            if (submittal.dueDate && submittal.status !== 'approved') {
                deadlines.push({
                    type: 'Submittal',
                    description: `Submittal ${submittal.number}: ${submittal.title}`,
                    dueDate: new Date(submittal.dueDate),
                    priority: 'medium'
                });
            }
        });

        this.data.orders.forEach(order => {
            if (order.expectedDelivery && order.status !== 'delivered') {
                deadlines.push({
                    type: 'Order',
                    description: `Order ${order.number}: ${order.vendor}`,
                    dueDate: new Date(order.expectedDelivery),
                    priority: 'medium'
                });
            }
        });

        // Sort by due date
        deadlines.sort((a, b) => a.dueDate - b.dueDate);
        const upcomingDeadlines = deadlines.slice(0, 10);

        if (upcomingDeadlines.length === 0) {
            container.innerHTML = '<div class="deadline-item">No upcoming deadlines</div>';
            return;
        }

        container.innerHTML = upcomingDeadlines.map(deadline => `
            <div class="deadline-item">
                <span class="priority-${deadline.priority}">${deadline.description}</span>
                <small>Due: ${this.formatDate(deadline.dueDate)}</small>
            </div>
        `).join('');
    }

    // File Management
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleFileDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    processFiles(files) {
        files.forEach(file => {
            const fileData = {
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                type: file.type,
                uploadDate: new Date().toISOString(),
                content: null // In a real app, you'd upload to server
            };

            // For demo purposes, we'll just store file metadata
            this.data.files.push(fileData);
        });

        this.saveData('files');
        this.renderFileList();
        this.showNotification('Files uploaded successfully!', 'success');
    }

    renderFileList() {
        const container = document.getElementById('fileListContainer');
        
        if (this.data.files.length === 0) {
            container.innerHTML = '<div class="text-center">No files uploaded yet</div>';
            return;
        }

        container.innerHTML = this.data.files.map(file => `
            <div class="file-item" data-file-id="${file.id}">
                <div class="file-icon">
                    <i class="${this.getFileIcon(file.type)}"></i>
                </div>
                <div class="file-name">${file.name}</div>
                <div class="file-size">${this.formatFileSize(file.size)}</div>
                <div class="file-actions mt-2">
                    <button class="action-btn delete-btn" onclick="dashboard.deleteFile('${file.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    getFileIcon(type) {
        if (type.includes('pdf')) return 'fas fa-file-pdf';
        if (type.includes('word')) return 'fas fa-file-word';
        if (type.includes('excel') || type.includes('spreadsheet')) return 'fas fa-file-excel';
        if (type.includes('image')) return 'fas fa-file-image';
        if (type.includes('dwg') || type.includes('autocad')) return 'fas fa-drafting-compass';
        return 'fas fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    deleteFile(fileId) {
        if (confirm('Are you sure you want to delete this file?')) {
            this.data.files = this.data.files.filter(file => file.id !== fileId);
            this.saveData('files');
            this.renderFileList();
            this.showNotification('File deleted successfully!', 'success');
        }
    }

    compareFiles() {
        if (this.data.files.length < 2) {
            this.showNotification('Please upload at least 2 files to compare', 'warning');
            return;
        }
        
        // In a real implementation, this would use AI to compare files
        this.showNotification('File comparison feature would integrate with Manus AI for analysis', 'info');
    }

    analyzeFile() {
        if (this.data.files.length === 0) {
            this.showNotification('Please upload a file to analyze', 'warning');
            return;
        }
        
        // In a real implementation, this would use AI to analyze files
        this.showNotification('File analysis feature would integrate with Manus AI for insights', 'info');
    }

    // Form Management
    showForm(formId) {
        document.getElementById(formId).style.display = 'block';
        this.populateFormDefaults(formId);
    }

    hideForm(formId) {
        document.getElementById(formId).style.display = 'none';
        document.getElementById(formId).querySelector('form').reset();
    }

    populateFormDefaults(formId) {
        const today = new Date().toISOString().split('T')[0];
        
        switch(formId) {
            case 'rfiForm':
                document.getElementById('rfiDate').value = today;
                document.getElementById('rfiNumber').value = `RFI-${String(this.data.rfis.length + 1).padStart(3, '0')}`;
                break;
            case 'submittalForm':
                document.getElementById('submittalDate').value = today;
                document.getElementById('submittalNumber').value = `SUB-${String(this.data.submittals.length + 1).padStart(3, '0')}`;
                break;
            case 'timeEntryForm':
                document.getElementById('timeDate').value = today;
                break;
            case 'orderForm':
                document.getElementById('orderDate').value = today;
                document.getElementById('orderNumber').value = `PO-${String(this.data.orders.length + 1).padStart(4, '0')}`;
                break;
            case 'punchForm':
                document.getElementById('punchDate').value = today;
                document.getElementById('punchNumber').value = `P-${String(this.data.punchItems.length + 1).padStart(3, '0')}`;
                break;
            case 'dailyEntryForm':
                document.getElementById('entryDate').value = today;
                break;
        }
    }

    // Form Handlers
    handleRfiSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const rfi = {
            id: Date.now(),
            number: formData.get('rfiNumber'),
            date: formData.get('rfiDate'),
            subject: formData.get('rfiSubject'),
            description: formData.get('rfiDescription'),
            priority: formData.get('rfiPriority'),
            dueDate: formData.get('rfiDueDate'),
            status: 'open',
            createdAt: new Date().toISOString()
        };

        this.data.rfis.push(rfi);
        this.saveData('rfis');
        this.hideForm('rfiForm');
        this.renderRfiTable();
        this.updateDashboardStats();
        this.showNotification('RFI created successfully!', 'success');
    }

    handleSubmittalSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const submittal = {
            id: Date.now(),
            number: formData.get('submittalNumber'),
            date: formData.get('submittalDate'),
            title: formData.get('submittalTitle'),
            description: formData.get('submittalDescription'),
            type: formData.get('submittalType'),
            dueDate: formData.get('submittalDueDate'),
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        this.data.submittals.push(submittal);
        this.saveData('submittals');
        this.hideForm('submittalForm');
        this.renderSubmittalTable();
        this.updateDashboardStats();
        this.showNotification('Submittal created successfully!', 'success');
    }

    handleTimeEntrySubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const quantity = parseFloat(formData.get('timeQuantity'));
        const rate = parseFloat(formData.get('timeRate'));
        
        const timeEntry = {
            id: Date.now(),
            date: formData.get('timeDate'),
            category: formData.get('timeCategory'),
            description: formData.get('timeDescription'),
            quantity: quantity,
            unit: formData.get('timeUnit'),
            rate: rate,
            total: quantity * rate,
            createdAt: new Date().toISOString()
        };

        this.data.timeEntries.push(timeEntry);
        this.saveData('timeEntries');
        this.hideForm('timeEntryForm');
        this.renderTimeTable();
        this.showNotification('Time entry added successfully!', 'success');
    }

    handleOrderSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const order = {
            id: Date.now(),
            number: formData.get('orderNumber'),
            date: formData.get('orderDate'),
            vendor: formData.get('vendorName'),
            contact: formData.get('vendorContact'),
            description: formData.get('orderDescription'),
            amount: parseFloat(formData.get('orderAmount')),
            expectedDelivery: formData.get('expectedDelivery'),
            status: 'ordered',
            createdAt: new Date().toISOString()
        };

        this.data.orders.push(order);
        this.saveData('orders');
        this.hideForm('orderForm');
        this.renderOrderTable();
        this.updateDashboardStats();
        this.showNotification('Order created successfully!', 'success');
    }

    handlePunchSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const punchItem = {
            id: Date.now(),
            number: formData.get('punchNumber'),
            date: formData.get('punchDate'),
            location: formData.get('punchLocation'),
            trade: formData.get('punchTrade'),
            description: formData.get('punchDescription'),
            priority: formData.get('punchPriority'),
            assignedTo: formData.get('punchAssignedTo'),
            status: 'open',
            createdAt: new Date().toISOString()
        };

        this.data.punchItems.push(punchItem);
        this.saveData('punchItems');
        this.hideForm('punchForm');
        this.renderPunchTable();
        this.updateDashboardStats();
        this.showNotification('Punch list item added successfully!', 'success');
    }

    handleDailyEntrySubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const dailyEntry = {
            id: Date.now(),
            date: formData.get('entryDate'),
            weather: formData.get('weather'),
            workPerformed: formData.get('workPerformed'),
            issues: formData.get('issues'),
            nextDayPlan: formData.get('nextDayPlan'),
            crewSize: parseInt(formData.get('crewSize')) || 0,
            hoursWorked: parseFloat(formData.get('hoursWorked')) || 0,
            createdAt: new Date().toISOString()
        };

        this.data.dailyEntries.push(dailyEntry);
        this.saveData('dailyEntries');
        this.hideForm('dailyEntryForm');
        this.renderDailyEntries();
        this.showNotification('Daily entry added successfully!', 'success');
    }

    // Table Renderers
    renderRfiTable() {
        const tbody = document.getElementById('rfiTableBody');
        
        if (this.data.rfis.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No RFIs found</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.rfis.map(rfi => `
            <tr>
                <td>${rfi.number}</td>
                <td>${rfi.subject}</td>
                <td>${this.formatDate(new Date(rfi.date))}</td>
                <td><span class="priority-${rfi.priority}">${rfi.priority.toUpperCase()}</span></td>
                <td><span class="status-badge status-${rfi.status}">${rfi.status}</span></td>
                <td>${rfi.dueDate ? this.formatDate(new Date(rfi.dueDate)) : 'N/A'}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="dashboard.editRfi('${rfi.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="dashboard.deleteRfi('${rfi.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${rfi.status !== 'completed' ? `
                        <button class="action-btn complete-btn" onclick="dashboard.completeRfi('${rfi.id}')">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }

    renderSubmittalTable() {
        const tbody = document.getElementById('submittalTableBody');
        
        if (this.data.submittals.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No submittals found</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.submittals.map(submittal => `
            <tr>
                <td>${submittal.number}</td>
                <td>${submittal.title}</td>
                <td>${submittal.type}</td>
                <td>${this.formatDate(new Date(submittal.date))}</td>
                <td><span class="status-badge status-${submittal.status}">${submittal.status}</span></td>
                <td>${submittal.dueDate ? this.formatDate(new Date(submittal.dueDate)) : 'N/A'}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="dashboard.editSubmittal('${submittal.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="dashboard.deleteSubmittal('${submittal.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderTimeTable() {
        const tbody = document.getElementById('timeTableBody');
        
        if (this.data.timeEntries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No time entries found</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.timeEntries.map(entry => `
            <tr>
                <td>${this.formatDate(new Date(entry.date))}</td>
                <td>${entry.category}</td>
                <td>${entry.description}</td>
                <td>${entry.quantity}</td>
                <td>${entry.unit}</td>
                <td>$${entry.rate.toFixed(2)}</td>
                <td>$${entry.total.toFixed(2)}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="dashboard.editTimeEntry('${entry.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="dashboard.deleteTimeEntry('${entry.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderOrderTable() {
        const tbody = document.getElementById('orderTableBody');
        
        if (this.data.orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No orders found</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.orders.map(order => `
            <tr>
                <td>${order.number}</td>
                <td>${order.vendor}</td>
                <td>${order.description}</td>
                <td>$${order.amount.toFixed(2)}</td>
                <td>${this.formatDate(new Date(order.date))}</td>
                <td>${order.expectedDelivery ? this.formatDate(new Date(order.expectedDelivery)) : 'N/A'}</td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                <td>
                    <button class="action-btn edit-btn" onclick="dashboard.editOrder('${order.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="dashboard.deleteOrder('${order.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderPunchTable() {
        const tbody = document.getElementById('punchTableBody');
        
        if (this.data.punchItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">No punch list items found</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.punchItems.map(item => `
            <tr>
                <td>${item.number}</td>
                <td>${item.location}</td>
                <td>${item.trade}</td>
                <td>${item.description}</td>
                <td><span class="priority-${item.priority}">${item.priority.toUpperCase()}</span></td>
                <td>${item.assignedTo || 'Unassigned'}</td>
                <td><span class="status-badge status-${item.status}">${item.status}</span></td>
                <td>${this.formatDate(new Date(item.date))}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="dashboard.editPunchItem('${item.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="dashboard.deletePunchItem('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${item.status !== 'completed' ? `
                        <button class="action-btn complete-btn" onclick="dashboard.completePunchItem('${item.id}')">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }

    renderDailyEntries() {
        const container = document.getElementById('dailyEntriesContainer');
        
        if (this.data.dailyEntries.length === 0) {
            container.innerHTML = '<div class="text-center">No daily entries found</div>';
            return;
        }

        // Sort by date descending
        const sortedEntries = [...this.data.dailyEntries].sort((a, b) => new Date(b.date) - new Date(a.date));

        container.innerHTML = sortedEntries.map(entry => `
            <div class="daily-entry">
                <div class="entry-header">
                    <div class="entry-date">${this.formatDate(new Date(entry.date))}</div>
                    <div class="entry-weather">${entry.weather || 'Weather not recorded'}</div>
                </div>
                
                <div class="entry-section">
                    <h4>Work Performed</h4>
                    <p>${entry.workPerformed}</p>
                </div>
                
                ${entry.issues ? `
                    <div class="entry-section">
                        <h4>Issues/Concerns</h4>
                        <p>${entry.issues}</p>
                    </div>
                ` : ''}
                
                ${entry.nextDayPlan ? `
                    <div class="entry-section">
                        <h4>Next Day Plan</h4>
                        <p>${entry.nextDayPlan}</p>
                    </div>
                ` : ''}
                
                <div class="entry-stats">
                    <div class="entry-stat">
                        <i class="fas fa-users"></i>
                        <span>Crew Size: ${entry.crewSize}</span>
                    </div>
                    <div class="entry-stat">
                        <i class="fas fa-clock"></i>
                        <span>Hours: ${entry.hoursWorked}</span>
                    </div>
                    <div class="entry-actions">
                        <button class="action-btn edit-btn" onclick="dashboard.editDailyEntry('${entry.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="dashboard.deleteDailyEntry('${entry.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // CRUD Operations
    completeRfi(id) {
        const rfi = this.data.rfis.find(r => r.id == id);
        if (rfi) {
            rfi.status = 'completed';
            this.saveData('rfis');
            this.renderRfiTable();
            this.updateDashboardStats();
            this.showNotification('RFI marked as completed!', 'success');
        }
    }

    deleteRfi(id) {
        if (confirm('Are you sure you want to delete this RFI?')) {
            this.data.rfis = this.data.rfis.filter(r => r.id != id);
            this.saveData('rfis');
            this.renderRfiTable();
            this.updateDashboardStats();
            this.showNotification('RFI deleted successfully!', 'success');
        }
    }

    completePunchItem(id) {
        const item = this.data.punchItems.find(p => p.id == id);
        if (item) {
            item.status = 'completed';
            this.saveData('punchItems');
            this.renderPunchTable();
            this.updateDashboardStats();
            this.showNotification('Punch list item marked as completed!', 'success');
        }
    }

    deletePunchItem(id) {
        if (confirm('Are you sure you want to delete this punch list item?')) {
            this.data.punchItems = this.data.punchItems.filter(p => p.id != id);
            this.saveData('punchItems');
            this.renderPunchTable();
            this.updateDashboardStats();
            this.showNotification('Punch list item deleted successfully!', 'success');
        }
    }

    // Similar delete methods for other entities
    deleteSubmittal(id) {
        if (confirm('Are you sure you want to delete this submittal?')) {
            this.data.submittals = this.data.submittals.filter(s => s.id != id);
            this.saveData('submittals');
            this.renderSubmittalTable();
            this.updateDashboardStats();
            this.showNotification('Submittal deleted successfully!', 'success');
        }
    }

    deleteTimeEntry(id) {
        if (confirm('Are you sure you want to delete this time entry?')) {
            this.data.timeEntries = this.data.timeEntries.filter(t => t.id != id);
            this.saveData('timeEntries');
            this.renderTimeTable();
            this.showNotification('Time entry deleted successfully!', 'success');
        }
    }

    deleteOrder(id) {
        if (confirm('Are you sure you want to delete this order?')) {
            this.data.orders = this.data.orders.filter(o => o.id != id);
            this.saveData('orders');
            this.renderOrderTable();
            this.updateDashboardStats();
            this.showNotification('Order deleted successfully!', 'success');
        }
    }

    deleteDailyEntry(id) {
        if (confirm('Are you sure you want to delete this daily entry?')) {
            this.data.dailyEntries = this.data.dailyEntries.filter(d => d.id != id);
            this.saveData('dailyEntries');
            this.renderDailyEntries();
            this.showNotification('Daily entry deleted successfully!', 'success');
        }
    }

    // Report Generation
    generateEndOfDayReport() {
        const today = new Date().toISOString().split('T')[0];
        const todayEntry = this.data.dailyEntries.find(entry => entry.date === today);
        
        let report = `MH CONSTRUCTION - END OF DAY REPORT\n`;
        report += `Date: ${this.formatDate(new Date())}\n`;
        report += `Project Engineer: ${document.getElementById('userName').textContent}\n`;
        report += `${'='.repeat(50)}\n\n`;

        // Daily Summary
        if (todayEntry) {
            report += `DAILY SUMMARY\n`;
            report += `Weather: ${todayEntry.weather || 'Not recorded'}\n`;
            report += `Crew Size: ${todayEntry.crewSize}\n`;
            report += `Hours Worked: ${todayEntry.hoursWorked}\n\n`;
            
            report += `WORK PERFORMED:\n${todayEntry.workPerformed}\n\n`;
            
            if (todayEntry.issues) {
                report += `ISSUES/CONCERNS:\n${todayEntry.issues}\n\n`;
            }
            
            if (todayEntry.nextDayPlan) {
                report += `NEXT DAY PLAN:\n${todayEntry.nextDayPlan}\n\n`;
            }
        } else {
            report += `DAILY SUMMARY\nNo daily entry recorded for today.\n\n`;
        }

        // Project Status
        report += `PROJECT STATUS\n`;
        report += `Active RFIs: ${this.data.rfis.filter(rfi => rfi.status !== 'completed').length}\n`;
        report += `Pending Submittals: ${this.data.submittals.filter(sub => sub.status !== 'approved').length}\n`;
        report += `Open Orders: ${this.data.orders.filter(order => order.status !== 'delivered').length}\n`;
        report += `Punch List Items: ${this.data.punchItems.filter(item => item.status !== 'completed').length}\n\n`;

        // Recent RFIs
        const recentRfis = this.data.rfis.filter(rfi => {
            const rfiDate = new Date(rfi.date);
            const daysDiff = (new Date() - rfiDate) / (1000 * 60 * 60 * 24);
            return daysDiff <= 7;
        });

        if (recentRfis.length > 0) {
            report += `RECENT RFIs (Last 7 days)\n`;
            recentRfis.forEach(rfi => {
                report += `- ${rfi.number}: ${rfi.subject} (${rfi.status.toUpperCase()})\n`;
            });
            report += `\n`;
        }

        // Time & Materials Summary
        const todayTimeEntries = this.data.timeEntries.filter(entry => entry.date === today);
        if (todayTimeEntries.length > 0) {
            report += `TODAY'S TIME & MATERIALS\n`;
            let totalCost = 0;
            todayTimeEntries.forEach(entry => {
                report += `- ${entry.description}: ${entry.quantity} ${entry.unit} @ $${entry.rate} = $${entry.total.toFixed(2)}\n`;
                totalCost += entry.total;
            });
            report += `Total: $${totalCost.toFixed(2)}\n\n`;
        }

        // Upcoming Deadlines
        const upcomingDeadlines = [];
        this.data.rfis.forEach(rfi => {
            if (rfi.dueDate && rfi.status !== 'completed') {
                const daysUntilDue = Math.ceil((new Date(rfi.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                if (daysUntilDue <= 7) {
                    upcomingDeadlines.push(`RFI ${rfi.number}: ${rfi.subject} (Due in ${daysUntilDue} days)`);
                }
            }
        });

        if (upcomingDeadlines.length > 0) {
            report += `UPCOMING DEADLINES (Next 7 days)\n`;
            upcomingDeadlines.forEach(deadline => {
                report += `- ${deadline}\n`;
            });
            report += `\n`;
        }

        report += `${'='.repeat(50)}\n`;
        report += `Report generated: ${new Date().toLocaleString()}\n`;
        report += `Dashboard: MH Construction Project Engineer Dashboard\n`;

        // Display in modal
        document.getElementById('reportContent').textContent = report;
        document.getElementById('reportModal').style.display = 'block';
    }

    copyReportToClipboard() {
        const reportContent = document.getElementById('reportContent').textContent;
        navigator.clipboard.writeText(reportContent).then(() => {
            this.showNotification('Report copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy report to clipboard', 'error');
        });
    }

    emailReport() {
        const reportContent = document.getElementById('reportContent').textContent;
        const subject = `End of Day Report - ${this.formatDate(new Date())}`;
        const body = encodeURIComponent(reportContent);
        
        // Open default email client
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
    }

    closeModal() {
        document.getElementById('reportModal').style.display = 'none';
    }

    // Utility Methods
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    saveData(key) {
        localStorage.setItem(key, JSON.stringify(this.data[key]));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Edit methods (placeholder implementations)
    editRfi(id) { this.showNotification('Edit functionality would open a form with current data', 'info'); }
    editSubmittal(id) { this.showNotification('Edit functionality would open a form with current data', 'info'); }
    editTimeEntry(id) { this.showNotification('Edit functionality would open a form with current data', 'info'); }
    editOrder(id) { this.showNotification('Edit functionality would open a form with current data', 'info'); }
    editPunchItem(id) { this.showNotification('Edit functionality would open a form with current data', 'info'); }
    editDailyEntry(id) { this.showNotification('Edit functionality would open a form with current data', 'info'); }
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new ProjectEngineerDashboard();
});

