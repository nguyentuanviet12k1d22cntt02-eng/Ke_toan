/**
 * AI Debt Collection Learning Hub - Application Logic
 * Controller for Tabs, Portfolio Search, Prompt Playground, and Rubrics
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCurriculum();
  initPortfolio();
  initPolicyAndTemplates();
  initPlayground();
  initRubrics();
});

/* ==========================================================================
   TOAST NOTIFICATION HELPER
   ========================================================================== */
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
      <path d="M20 6L9 17l-5-5"></path>
    </svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/* ==========================================================================
   TAB NAVIGATION
   ========================================================================== */
function initNavigation() {
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

/* ==========================================================================
   TAB 1: CURRICULUM (12 SESSIONS)
   ========================================================================== */
function initCurriculum() {
  const container = document.getElementById('sessions-container');
  if (!container || !COURSE_DATA || !COURSE_DATA.sessions) return;

  container.innerHTML = COURSE_DATA.sessions.map(s => {
    const stepsHtml = (s.steps || []).map(step => `<li>${step}</li>`).join('');

    return `
      <article class="session-card">
        <div class="session-card-header">
          <div class="session-badge-wrap">
            <span class="session-time">${s.time}</span>
            <span class="session-lesson">${s.lesson}</span>
          </div>
          <span class="badge badge-tool" style="color: var(--primary-color); border-color: var(--primary-border); background: var(--primary-light); font-weight: 600;">
            ${s.recommendedTool || s.aiTools[0]}
          </span>
        </div>

        <h3 class="session-title">${s.title}</h3>
        <p class="session-context">${s.context}</p>

        <!-- HƯỚNG DẪN THỰC HÀNH 3 BƯỚC NGAY TRÊN CARD -->
        <div class="card-quick-guide">
          <div class="quick-guide-header">
            <span>QUY TRÌNH 3 BƯỚC THỰC HÀNH:</span>
          </div>
          <ul class="quick-steps-list">
            ${stepsHtml}
          </ul>
          <div class="card-checkpoint">
            <strong>Lưu ý:</strong> ${s.keyCheckpoint || s.commonGotchas}
          </div>
        </div>

        <div class="session-card-footer">
          <div class="deliverable-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
            ${s.deliverable.split('(')[0].trim()}
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-outline btn-sm btn-quick-copy-prompt" data-prompt="${encodeURIComponent(s.practicalPrompt || s.promptAdvanced)}">
              Sao Chép Prompt
            </button>
            <button class="btn btn-primary btn-sm btn-view-session" data-session-id="${s.id}">
              Chi Tiết & Báo Cáo
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Quick copy prompt from card
  container.querySelectorAll('.btn-quick-copy-prompt').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const p = decodeURIComponent(btn.getAttribute('data-prompt'));
      navigator.clipboard.writeText(p).then(() => showToast('Đã sao chép Prompt thực chiến!'));
    });
  });

  // Attach click listeners for session modal
  container.querySelectorAll('.btn-view-session').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-session-id'), 10);
      openSessionModal(id);
    });
  });

  // Modal close listeners
  const modal = document.getElementById('session-modal');
  const btnClose = document.getElementById('btn-close-session-modal');
  const btnDismiss = document.getElementById('btn-modal-dismiss');
  const btnToPlayground = document.getElementById('btn-modal-to-playground');

  [btnClose, btnDismiss].forEach(b => {
    if (b) b.addEventListener('click', () => modal.classList.remove('active'));
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  if (btnToPlayground) {
    btnToPlayground.addEventListener('click', () => {
      const currentSessionId = btnToPlayground.getAttribute('data-session-id');
      modal.classList.remove('active');
      const pgTabBtn = document.getElementById('nav-playground');
      if (pgTabBtn) pgTabBtn.click();
      const sessionSelect = document.getElementById('pg-session-select');
      if (sessionSelect && currentSessionId) {
        sessionSelect.value = currentSessionId;
        sessionSelect.dispatchEvent(new Event('change'));
      }
    });
  }
}

function openSessionModal(sessionId) {
  const session = COURSE_DATA.sessions.find(s => s.id === sessionId);
  if (!session) return;

  const modal = document.getElementById('session-modal');
  document.getElementById('modal-session-time').textContent = session.time + ' | ' + session.lesson;
  document.getElementById('modal-session-title').textContent = session.title;
  document.getElementById('btn-modal-to-playground').setAttribute('data-session-id', session.id);

  const stepsHtml = (session.steps || []).map(step => `<li style="margin-bottom: 6px;">${step}</li>`).join('');

  const body = document.getElementById('modal-session-body');
  body.innerHTML = `
    <!-- PHẦN 1: HƯỚNG DẪN NHANH 3 BƯỚC & CÔNG CỤ -->
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); padding: 14px 16px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-weight: 700; color: #166534; font-size: 0.95rem;">QUY TRÌNH THỰC HÀNH TỪNG BƯỚC:</span>
        <span class="badge" style="background: #dcfce7; color: #15803d; border: 1px solid #86efac; font-weight: 600;">
          Công cụ khuyên dùng: ${session.recommendedTool || session.aiTools[0]}
        </span>
      </div>
      <ol style="margin-left: 20px; font-size: 0.875rem; color: #1e293b; line-height: 1.5;">
        ${stepsHtml}
      </ol>
      <div style="margin-top: 10px; background: #fffbeb; border-left: 3px solid var(--accent-color); padding: 8px 12px; font-size: 0.825rem; color: #92400e;">
        <strong>Lưu ý cốt tử:</strong> ${session.keyCheckpoint || session.commonGotchas}
      </div>
    </div>

    <!-- PHẦN 2: PROMPT THỰC CHIẾN NHẬP VAI -->
    <div class="prompt-box practical-prompt-highlight" style="margin-bottom: 16px;">
      <div class="prompt-box-header">
        <span class="prompt-box-title" style="color: var(--primary-color); font-size: 0.85rem;">
          Prompt Thực Chiến Nhập Vai Chuyên Viên (Sẵn Sàng Dùng Ngay)
        </span>
        <button class="btn btn-primary btn-sm btn-copy" data-copy="${encodeURIComponent(session.practicalPrompt || session.promptAdvanced)}">
          Sao Chép Prompt Này
        </button>
      </div>
      <div class="prompt-text" style="font-weight: 500;">${session.practicalPrompt || session.promptAdvanced}</div>
    </div>

    <!-- PHẦN 3: BỐI CẢNH & VẤN ĐỀ NGHIỆP VỤ -->
    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 0.95rem; margin-bottom: 6px; color: var(--text-primary);">Bối Cảnh & Vấn Đề Nghiệp Vụ:</h4>
      <p style="margin-bottom: 6px; font-size: 0.875rem;"><strong>Bối cảnh:</strong> ${session.context}</p>
      <p style="margin-bottom: 6px; font-size: 0.875rem;"><strong>Vấn đề phát sinh:</strong> ${session.problem}</p>
      <p style="font-size: 0.875rem;"><strong>Nhiệm vụ học viên:</strong> ${session.task}</p>
    </div>

    <!-- PHẦN 4: SO SÁNH PROMPT CƠ BẢN VS NÂNG CAO -->
    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 0.95rem; margin-bottom: 8px; color: var(--text-secondary);">So Sánh Prompt Cơ Bản vs Nâng Cao (Giáo Trình):</h4>
      
      <div class="prompt-box">
        <div class="prompt-box-header">
          <span class="prompt-box-title">Prompt Cơ Bản (Hỏi Chung Chung - Dễ Lỗi)</span>
          <button class="btn btn-outline btn-sm btn-copy" data-copy="${encodeURIComponent(session.promptBasic)}">Sao chép</button>
        </div>
        <div class="prompt-text">${session.promptBasic}</div>
      </div>

      <div class="prompt-box">
        <div class="prompt-box-header">
          <span class="prompt-box-title">Prompt Nâng Cao (Đầy Đủ Ràng Buộc)</span>
          <button class="btn btn-outline btn-sm btn-copy" data-copy="${encodeURIComponent(session.promptAdvanced)}">Sao chép</button>
        </div>
        <div class="prompt-text">${session.promptAdvanced}</div>
      </div>
    </div>

    <!-- PHẦN 5: ĐẦU RA & HƯỚNG DẪN GIẢNG VIÊN -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
      <div style="background: var(--bg-subtle); padding: 12px; border-radius: var(--radius-sm);">
        <h4 style="font-size: 0.85rem; color: var(--primary-color); margin-bottom: 4px;">Sản Phẩm Đầu Ra:</h4>
        <p style="font-size: 0.825rem; font-weight: 600;">${session.deliverable}</p>
      </div>

      <div style="background: var(--bg-subtle); padding: 12px; border-radius: var(--radius-sm);">
        <h4 style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">Tiêu Chí Chấm Nhanh:</h4>
        <p style="font-size: 0.825rem;">${session.quickGrading}</p>
      </div>
    </div>
  `;

  // Copy buttons inside modal
  body.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = decodeURIComponent(btn.getAttribute('data-copy'));
      navigator.clipboard.writeText(text).then(() => showToast('Đã sao chép nội dung prompt!'));
    });
  });

  modal.classList.add('active');
}

/* ==========================================================================
   TAB 2: PORTFOLIO EXPLORER (500 CUSTOMERS)
   ========================================================================== */
let currentPage = 1;
const pageSize = 25;
let filteredCustomers = [];

function initPortfolio() {
  if (!PORTFOLIO_DATA || !PORTFOLIO_DATA.customers) return;
  filteredCustomers = [...PORTFOLIO_DATA.customers];

  const searchInput = document.getElementById('cust-search');
  const filterPriority = document.getElementById('filter-priority');
  const filterDpd = document.getElementById('filter-dpd');
  const filterProduct = document.getElementById('filter-product');
  const btnReset = document.getElementById('btn-reset-filters');
  const btnPrev = document.getElementById('btn-prev-page');
  const btnNext = document.getElementById('btn-next-page');

  function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();
    const pri = filterPriority.value;
    const dpdVal = filterDpd.value;
    const prod = filterProduct.value;

    filteredCustomers = PORTFOLIO_DATA.customers.filter(c => {
      if (q && !(c.Customer_ID.toLowerCase().includes(q) || c.Customer_Name.toLowerCase().includes(q))) {
        return false;
      }
      if (pri && c.Benchmark_Priority !== pri) {
        return false;
      }
      if (prod && c.Loan_Product !== prod) {
        return false;
      }
      if (dpdVal) {
        if (dpdVal === 'dpd-0' && c.DPD !== 0) return false;
        if (dpdVal === 'dpd-1-9' && (c.DPD < 1 || c.DPD > 9)) return false;
        if (dpdVal === 'dpd-10-89' && (c.DPD < 10 || c.DPD > 89)) return false;
        if (dpdVal === 'dpd-90-plus' && c.DPD < 90) return false;
      }
      return true;
    });

    currentPage = 1;
    renderCustomersTable();
  }

  [searchInput, filterPriority, filterDpd, filterProduct].forEach(el => {
    if (el) el.addEventListener('input', applyFilters);
  });

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      searchInput.value = '';
      filterPriority.value = '';
      filterDpd.value = '';
      filterProduct.value = '';
      applyFilters();
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderCustomersTable();
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      const maxPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
      if (currentPage < maxPages) {
        currentPage++;
        renderCustomersTable();
      }
    });
  }

  renderCustomersTable();

  // Customer modal close
  const custModal = document.getElementById('customer-modal');
  const btnCloseCust = document.getElementById('btn-close-customer-modal');
  const btnCloseCust2 = document.getElementById('btn-close-cust-modal-btn');
  [btnCloseCust, btnCloseCust2].forEach(b => {
    if (b) b.addEventListener('click', () => custModal.classList.remove('active'));
  });
  if (custModal) {
    custModal.addEventListener('click', (e) => {
      if (e.target === custModal) custModal.classList.remove('active');
    });
  }
}

function renderCustomersTable() {
  const tbody = document.getElementById('customers-tbody');
  const paginationInfo = document.getElementById('pagination-info');
  const pageDisplay = document.getElementById('page-num-display');
  if (!tbody) return;

  const total = filteredCustomers.length;
  const maxPages = Math.ceil(total / pageSize) || 1;
  if (currentPage > maxPages) currentPage = maxPages;

  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageData = filteredCustomers.slice(start, end);

  if (total === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 32px;">Không tìm thấy khách hàng nào phù hợp với bộ lọc.</td></tr>`;
    if (paginationInfo) paginationInfo.textContent = '0 / 0 khách hàng';
    if (pageDisplay) pageDisplay.textContent = '0 / 0';
    return;
  }

  if (paginationInfo) paginationInfo.textContent = `Hiển thị ${start + 1} - ${end} trong tổng số ${total} khách hàng`;
  if (pageDisplay) pageDisplay.textContent = `${currentPage} / ${maxPages}`;

  tbody.innerHTML = pageData.map(c => {
    let badgeClass = 'badge-p4';
    if (c.Benchmark_Priority.startsWith('P1')) badgeClass = 'badge-p1';
    else if (c.Benchmark_Priority.startsWith('P2')) badgeClass = 'badge-p2';
    else if (c.Benchmark_Priority.startsWith('P3')) badgeClass = 'badge-p3';

    const dpdHighlight = c.DPD >= 90 ? 'color: #b91c1c; font-weight: 700;' : (c.DPD > 0 ? 'font-weight: 600;' : 'color: var(--text-muted);');

    return `
      <tr data-cust-id="${c.Customer_ID}">
        <td><strong>${c.Customer_ID}</strong></td>
        <td>${c.Customer_Name} <span style="font-size: 0.75rem; color: var(--text-muted);">(${c.Age}t)</span></td>
        <td><span style="font-size: 0.8rem;">${c.Loan_Product}</span></td>
        <td style="text-align: right; font-weight: 600;">${c.Outstanding_M.toLocaleString('vi-VN')}</td>
        <td style="text-align: center; ${dpdHighlight}">${c.DPD}</td>
        <td>${c.Monthly_Income_M} tr</td>
        <td><span style="font-size: 0.8rem;">${c.Contact_Status}</span></td>
        <td><span style="font-size: 0.8rem;">${c.Hardship_Reason}</span></td>
        <td><span class="badge ${badgeClass}">${c.Benchmark_Priority.split(' - ')[0]}</span></td>
        <td>
          <button class="btn btn-outline btn-sm btn-view-cust" data-cust-id="${c.Customer_ID}">Xem</button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('tr').forEach(tr => {
    tr.addEventListener('click', (e) => {
      const custId = tr.getAttribute('data-cust-id');
      if (custId) openCustomerModal(custId);
    });
  });
}

function openCustomerModal(custId) {
  const c = PORTFOLIO_DATA.customers.find(item => item.Customer_ID === custId);
  if (!c) return;

  const modal = document.getElementById('customer-modal');
  document.getElementById('modal-cust-id').textContent = c.Customer_ID;
  document.getElementById('modal-cust-name').textContent = c.Customer_Name + ` (${c.Age} tuổi - ${c.Region})`;

  let badgeClass = 'badge-p4';
  if (c.Benchmark_Priority.startsWith('P1')) badgeClass = 'badge-p1';
  else if (c.Benchmark_Priority.startsWith('P2')) badgeClass = 'badge-p2';
  else if (c.Benchmark_Priority.startsWith('P3')) badgeClass = 'badge-p3';
  document.getElementById('modal-cust-id').className = `badge ${badgeClass}`;

  const body = document.getElementById('modal-cust-body');
  body.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
      <div>
        <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px;">Thông Tin Khoản Vay</h4>
        <p style="margin-bottom: 4px;"><strong>Sản phẩm:</strong> ${c.Loan_Product}</p>
        <p style="margin-bottom: 4px;"><strong>Số lượng hợp đồng:</strong> ${c.Loan_Count}</p>
        <p style="margin-bottom: 4px;"><strong>Dư nợ gốc ban đầu:</strong> ${c.Original_Principal_M.toLocaleString('vi-VN')} tr VND</p>
        <p style="margin-bottom: 4px;"><strong>Dư nợ hiện tại:</strong> <span style="font-weight: 700; color: var(--primary-color);">${c.Outstanding_M.toLocaleString('vi-VN')} tr VND</span></p>
        <p style="margin-bottom: 4px;"><strong>Số ngày quá hạn (DPD):</strong> <span style="font-weight: 700; color: ${c.DPD >= 90 ? '#b91c1c' : '#d97706'}">${c.DPD} ngày</span></p>
        <p><strong>Tài sản đảm bảo:</strong> ${c.Collateral}</p>
      </div>

      <div>
        <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px;">Tình Trạng & Tương Tác</h4>
        <p style="margin-bottom: 4px;"><strong>Tình trạng việc làm:</strong> ${c.Employment_Status}</p>
        <p style="margin-bottom: 4px;"><strong>Thu nhập hàng tháng:</strong> ${c.Monthly_Income_M} tr VND</p>
        <p style="margin-bottom: 4px;"><strong>Lý do khó khăn:</strong> ${c.Hardship_Reason}</p>
        <p style="margin-bottom: 4px;"><strong>Trạng thái liên hệ:</strong> ${c.Contact_Status}</p>
        <p style="margin-bottom: 4px;"><strong>Liên hệ gần nhất:</strong> ${c.Last_Contact_Date || 'Chưa có'} (${c.Last_Contact_Channel || 'N/A'})</p>
        <p style="margin-bottom: 4px;"><strong>Ngày hẹn thanh toán:</strong> ${c.Promise_Date || '<span style="color: #b91c1c;">(Chưa cam kết)</span>'}</p>
        <p><strong>SĐT mô phỏng:</strong> 0${c.Phone_Synthetic}</p>
      </div>
    </div>

    <div style="background: var(--bg-subtle); border-left: 4px solid var(--primary-color); padding: 12px 16px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span style="font-weight: 700; font-size: 0.85rem; color: var(--primary-color);">ĐÁNH GIÁ BENCHMARK GIẢNG VIÊN:</span>
        <span class="badge ${badgeClass}">${c.Benchmark_Priority} (Score: ${c.Benchmark_Score})</span>
      </div>
      <p style="font-size: 0.875rem; color: var(--text-primary);"><strong>Hành động đề xuất:</strong> ${c.Benchmark_Action}</p>
    </div>
  `;

  const btnCopy = document.getElementById('btn-cust-copy-info');
  if (btnCopy) {
    btnCopy.onclick = () => {
      const summaryText = `MÃ KH: ${c.Customer_ID} - ${c.Customer_Name} (${c.Age}t, ${c.Region})
Sản phẩm: ${c.Loan_Product} | Dư nợ: ${c.Outstanding_M} tr VND | DPD: ${c.DPD} ngày
Thu nhập: ${c.Monthly_Income_M} tr/tháng | Việc làm: ${c.Employment_Status} | TSĐB: ${c.Collateral}
Liên hệ: ${c.Contact_Status} | Khó khăn: ${c.Hardship_Reason} | Hẹn trả: ${c.Promise_Date || 'Không'}
Mức ưu tiên chuẩn: ${c.Benchmark_Priority} (Score: ${c.Benchmark_Score})
Đề xuất: ${c.Benchmark_Action}`;
      navigator.clipboard.writeText(summaryText).then(() => showToast('Đã sao chép hồ sơ khách hàng!'));
    };
  }

  modal.classList.add('active');
}

/* ==========================================================================
   TAB 3: POLICY & TEMPLATES
   ========================================================================== */
function initPolicyAndTemplates() {
  if (!POLICY_DATA || !TEMPLATE_DATA) return;

  // Principles
  const principlesList = document.getElementById('policy-principles-list');
  if (principlesList) {
    principlesList.innerHTML = POLICY_DATA.principles.map(p => `
      <li>
        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>${p}</span>
      </li>
    `).join('');
  }

  // Non-inferable
  const nonInferableEl = document.getElementById('policy-noninferable');
  if (nonInferableEl) nonInferableEl.textContent = POLICY_DATA.nonInferable;

  // Workflow
  const workflowList = document.getElementById('policy-workflow-list');
  if (workflowList) {
    workflowList.innerHTML = POLICY_DATA.controlWorkflow.map(w => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: var(--bg-subtle); border-radius: var(--radius-sm); font-size: 0.85rem;">
        <div><strong>Bước ${w.step}:</strong> ${w.action}</div>
        <span class="badge" style="background: #e2e8f0; font-size: 0.75rem;">${w.role}</span>
      </div>
    `).join('');
  }

  // Templates
  const templatesContainer = document.getElementById('templates-container');
  if (templatesContainer) {
    templatesContainer.innerHTML = TEMPLATE_DATA.map(tpl => `
      <article class="template-card">
        <div class="template-header">
          <div>
            <span class="badge" style="background: var(--primary-light); color: var(--primary-color); margin-bottom: 4px;">${tpl.category}</span>
            <h4 class="template-title">${tpl.title}</h4>
          </div>
          <button class="btn btn-outline btn-sm btn-copy-tpl" data-tpl-id="${tpl.id}">Sao Chép Mẫu</button>
        </div>
        <pre class="template-content-pre" id="tpl-content-${tpl.id}">${tpl.content}</pre>
      </article>
    `).join('');

    templatesContainer.querySelectorAll('.btn-copy-tpl').forEach(btn => {
      btn.addEventListener('click', () => {
        const tplId = btn.getAttribute('data-tpl-id');
        const preEl = document.getElementById(`tpl-content-${tplId}`);
        if (preEl) {
          navigator.clipboard.writeText(preEl.textContent).then(() => {
            showToast('Đã sao chép biểu mẫu nghiệp vụ!');
          });
        }
      });
    });
  }
}

/* ==========================================================================
   TAB 4: PROMPT PLAYGROUND & DECISION LOG
   ========================================================================== */
let currentTool = 'ChatGPT';
let decisionLogs = [];

function initPlayground() {
  const sessionSelect = document.getElementById('pg-session-select');
  const promptInput = document.getElementById('pg-prompt-input');
  const btnBasic = document.getElementById('btn-load-basic-prompt');
  const btnAdv = document.getElementById('btn-load-adv-prompt');
  const btnRun = document.getElementById('btn-run-simulation');
  const outputBox = document.getElementById('pg-output-box');
  const btnAddLog = document.getElementById('btn-add-to-log');
  const btnExport = document.getElementById('btn-export-log');

  // Insert a Guide Banner inside the Playground Panel
  const panelLeft = document.querySelector('.playground-panel');
  let guideBanner = document.getElementById('pg-guide-banner');
  if (!guideBanner && panelLeft) {
    guideBanner = document.createElement('div');
    guideBanner.id = 'pg-guide-banner';
    guideBanner.style.cssText = 'background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 12px; margin-bottom: 14px; font-size: 0.825rem;';
    panelLeft.insertBefore(guideBanner, panelLeft.children[1]);
  }

  function updatePlaygroundGuide(s) {
    if (!s || !guideBanner) return;
    const stepsList = (s.steps || []).map(st => `<li>${st}</li>`).join('');
    guideBanner.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <strong style="color: #166534;">HƯỚNG DẪN THỰC HÀNH:</strong>
        <span class="badge" style="background: #dcfce7; color: #15803d; border: 1px solid #86efac; font-weight: 600;">
          ${s.recommendedTool || s.aiTools[0]}
        </span>
      </div>
      <ul style="margin-left: 16px; margin-bottom: 6px; color: #1e293b; line-height: 1.4;">${stepsList}</ul>
      <div style="background: #fffbeb; border-left: 3px solid #d97706; padding: 4px 8px; font-size: 0.78rem; color: #92400e;">
        <strong>Lưu ý:</strong> ${s.keyCheckpoint || s.commonGotchas}
      </div>
    `;

    // Automatically set active tool button matching recommendation if possible
    const recTool = s.recommendedTool ? s.recommendedTool.toLowerCase() : '';
    document.querySelectorAll('.tool-choice-btn').forEach(btn => {
      const t = btn.getAttribute('data-tool').toLowerCase();
      if (recTool.includes(t)) {
        document.querySelectorAll('.tool-choice-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTool = btn.getAttribute('data-tool');
      }
    });
  }

  // Populate sessions
  if (sessionSelect && COURSE_DATA && COURSE_DATA.sessions) {
    sessionSelect.innerHTML = COURSE_DATA.sessions.map(s => `
      <option value="${s.id}">Buổi ${s.id < 10 ? '0' + s.id : s.id}: ${s.title.split('–')[1] ? s.title.split('–')[1].trim() : s.title}</option>
    `).join('');

    sessionSelect.addEventListener('change', () => {
      const s = COURSE_DATA.sessions.find(item => item.id === parseInt(sessionSelect.value, 10));
      if (s) {
        promptInput.value = s.practicalPrompt || s.promptAdvanced;
        updatePlaygroundGuide(s);
      }
    });

    // Default load first session prompt & guide
    if (COURSE_DATA.sessions[0]) {
      promptInput.value = COURSE_DATA.sessions[0].practicalPrompt || COURSE_DATA.sessions[0].promptAdvanced;
      updatePlaygroundGuide(COURSE_DATA.sessions[0]);
    }
  }

  // Tool buttons
  document.querySelectorAll('.tool-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tool-choice-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTool = btn.getAttribute('data-tool');
    });
  });

  // Prompt load buttons
  if (btnBasic) {
    btnBasic.addEventListener('click', () => {
      const s = COURSE_DATA.sessions.find(item => item.id === parseInt(sessionSelect.value, 10));
      if (s) promptInput.value = s.promptBasic;
    });
  }

  if (btnAdv) {
    btnAdv.addEventListener('click', () => {
      const s = COURSE_DATA.sessions.find(item => item.id === parseInt(sessionSelect.value, 10));
      if (s) promptInput.value = s.practicalPrompt || s.promptAdvanced;
    });
  }

  // Simulation run
  if (btnRun) {
    btnRun.addEventListener('click', () => {
      const sId = parseInt(sessionSelect.value, 10);
      const session = COURSE_DATA.sessions.find(item => item.id === sId);
      const userPrompt = promptInput.value.trim();

      if (!userPrompt) {
        alert('Vui lòng nhập câu lệnh prompt trước khi chạy thử nghiệm.');
        return;
      }

      outputBox.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Đang gửi câu lệnh tới ${currentTool} và xử lý dữ liệu kiểm toán...</div>`;

      setTimeout(() => {
        const simResult = generateSimulatedResponse(session, currentTool, userPrompt);
        outputBox.innerHTML = simResult;
        btnAddLog.removeAttribute('disabled');
        showToast(`Đã nhận phản hồi mô phỏng từ ${currentTool}!`);
      }, 500);
    });
  }

  // Tagger buttons
  ['tag-fact', 'tag-infer', 'tag-gap'].forEach(tagId => {
    const btn = document.getElementById(tagId);
    if (btn) {
      btn.addEventListener('click', () => {
        let tagText = '[FACT]';
        if (tagId === 'tag-infer') { tagText = '[INFERENCE]'; }
        if (tagId === 'tag-gap') { tagText = '[MISSING_DATA - HUMAN_REVIEW]'; }

        showToast(`Đã chọn thẻ ${tagText}. Bạn có thể ghi chú vào AI Decision Log.`);
      });
    }
  });

  // Add to log
  if (btnAddLog) {
    btnAddLog.addEventListener('click', () => {
      const sId = parseInt(sessionSelect.value, 10);
      const session = COURSE_DATA.sessions.find(item => item.id === sId);
      const promptSnippet = promptInput.value.slice(0, 80) + '...';

      const newLog = {
        session: `Buổi ${sId}`,
        tool: currentTool,
        prompt: promptSnippet,
        output: `Hoàn thành bản nháp ${session.deliverable.split('(')[0]}`,
        check: 'Đã soát xét Fact vs Inference; Không phát hiện suy diễn trái phép.',
        decision: 'Chấp thuận đưa vào Draft chờ Trưởng nhóm phê duyệt.'
      };

      decisionLogs.push(newLog);
      renderDecisionLogs();
      showToast('Đã lưu bản ghi vào AI Decision Log!');
    });
  }

  // Export CSV
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      if (decisionLogs.length === 0) {
        alert('Chưa có dữ liệu nào trong nhật ký để xuất.');
        return;
      }

      let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
      csvContent += 'Buổi/Tình huống,Công cụ AI,Prompt tóm tắt,Kết quả AI,Kiểm tra (Fact/Infer/Gap),Quyết định cuối\n';

      decisionLogs.forEach(row => {
        csvContent += `"${row.session}","${row.tool}","${row.prompt.replace(/"/g, '""')}","${row.output.replace(/"/g, '""')}","${row.check.replace(/"/g, '""')}","${row.decision.replace(/"/g, '""')}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'AI_Decision_Log.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Đã xuất file AI_Decision_Log.csv thành công!');
    });
  }
}

function generateSimulatedResponse(session, tool, promptText) {
  const isBasic = promptText.length < 120;

  if (tool === 'ChatGPT') {
    if (isBasic) {
      return `
        <div style="color: #b91c1c; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px;">
          [CẢNH BÁO KIỂM TOÁN: PROMPT CƠ BẢN DỄ GẶP HALLUCINATION HOẶC SUY DIỄN KHÔNG CĂN CỨ]
        </div>
        <p><strong>Phản hồi từ ChatGPT:</strong> Dựa trên danh mục khách hàng, tôi thấy có nhiều khách hàng nợ tiền và bị chậm thanh toán. Khách hàng này có thể đang gặp khó khăn tài chính cá nhân hoặc cố tình trốn tránh nghĩa vụ. Bạn nên gọi điện nhắc nhở họ ngay và yêu cầu thanh toán trong 24h.</p>
        <div style="margin-top: 12px; background: #fee2e2; padding: 8px; border-radius: 4px; font-size: 0.8rem; color: #991b1b;">
          <strong>Nhận định chuyên viên:</strong> AI đang suy diễn từ <em>"cố tình trốn tránh"</em> (Inference vô căn cứ) và đưa ra hành động thiếu Call to Action văn minh theo Policy Book.
        </div>
      `;
    } else {
      return `
        <div style="color: #15803d; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px;">
          [KẾT QUẢ ĐẠT CHUẨN: ĐÃ ÁP DỤNG RÀNG BUỘC PHÂN BIỆT FACT & INFERENCE]
        </div>
        <p><strong>Phản hồi từ ChatGPT (Đóng vai Chuyên viên xử lý nợ):</strong></p>
        <div style="font-size: 0.85rem; line-height: 1.6; margin-top: 8px;">
          <p><strong>1. Dữ liệu thực tế ghi nhận (Facts):</strong></p>
          <ul style="margin-left: 20px; margin-bottom: 8px;">
            <li>Mã hồ sơ: KH0001 | Dư nợ: 984.4 tr VND | DPD: 75 ngày</li>
            <li>Trạng thái liên hệ: Đã liên hệ - hợp tác | Nguyên nhân: Chi phí y tế</li>
          </ul>
          <p><strong>2. Phân tích rủi ro & Khoảng trống thông tin (Reasoning & Gap):</strong></p>
          <ul style="margin-left: 20px; margin-bottom: 8px;">
            <li>Khách hàng có thiện chí hợp tác nhưng gặp biến cố chi phí y tế.</li>
            <li>Khoảng trống: Chưa có cam kết ngày trả cụ thể (Promise_Date: Null).</li>
          </ul>
          <p><strong>3. Đề xuất hành động theo Policy Book:</strong></p>
          <p>Xếp nhóm P2 - Liên hệ trong ngày bằng kênh điện thoại/SMS; khảo sát tiến độ điều trị y tế và đề xuất phương án giãn nợ có điều kiện theo Mẫu 2.</p>
          <span class="badge badge-fact">Fact Verified</span>
          <span class="badge badge-gap">Needs Human Review: Khung giãn nợ</span>
        </div>
      `;
    }
  } else if (tool === 'Gemini') {
    return `
      <div style="color: #1a73e8; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px;">
        [GEMINI - ĐÓNG VAI REVIEWER ĐỘC LẬP / PHẢN BIỆN CHÉO]
      </div>
      <div style="font-size: 0.85rem; line-height: 1.6;">
        <p><strong>Báo cáo thẩm định & Phản biện lỗ hổng logic:</strong></p>
        <ol style="margin-left: 20px; margin-top: 6px;">
          <li><strong>Mâu thuẫn DPD vs Ưu tiên:</strong> DPD = 75 ngày nhưng chưa chuyển sang trạng thái cảnh báo pháp lý là phù hợp, vì còn trong ngưỡng < 90 ngày.</li>
          <li><strong>Điểm nghi vấn về dòng tiền:</strong> Hồ sơ ghi "Chi phí y tế" nhưng thu nhập hàng tháng vẫn ghi nhận 40 triệu. Cần xác minh dòng tiền thực nhận sau khi trang trải viện phí.</li>
          <li><strong>Lỗ hổng liên lạc:</strong> Kênh liên hệ gần nhất là SMS. Cần chuyển sang gọi điện trực tiếp để xác minh thiện chí.</li>
          <li><strong>Rủi ro cam kết miệng:</strong> Tuyệt đối không chấp nhận cam kết miệng không có xác nhận qua SMS/Email lưu vết.</li>
        </ol>
      </div>
    `;
  } else if (tool === 'NotebookLM') {
    return `
      <div style="color: #7c3aed; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px;">
        [NOTEBOOKLM - TRÍCH DẪN NGUỒN CHÍNH SÁCH (POLICY BOOK)]
      </div>
      <div style="font-size: 0.85rem; line-height: 1.6;">
        <p><strong>Căn cứ đối chiếu từ Sổ tay Chính sách:</strong></p>
        <blockquote style="border-left: 3px solid #7c3aed; padding-left: 10px; margin: 8px 0; color: #4c1d95; font-style: italic;">
          "Căn cứ Mục 4 - Quy tắc giao tiếp mô phỏng: Trường hợp khách hàng có dấu hiệu khó khăn đặc biệt (sức khỏe, biến cố gia đình), chuyên viên không được đe dọa hoặc thúc ép, mà phải ghi nhận và chuyển người phụ trách xem xét giải pháp nhân văn."
        </blockquote>
        <blockquote style="border-left: 3px solid #7c3aed; padding-left: 10px; margin: 8px 0; color: #4c1d95; font-style: italic;">
          "Căn cứ Mục 7 - Thông tin cấm suy diễn: Cấm tự suy luận khả năng chi trả viện phí nếu khách hàng chưa cung cấp hóa đơn hoặc chứng từ y tế."
        </blockquote>
      </div>
    `;
  } else {
    return `
      <div style="color: #e11d48; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px;">
        [GAMMA - DÀN Ý SLIDE BÁO CÁO BAN GIÁM ĐỐC (6 SLIDES)]
      </div>
      <div style="font-size: 0.85rem; line-height: 1.6;">
        <p><strong>Cấu trúc slide đã kiểm duyệt nội dung sẵn sàng đưa vào Gamma:</strong></p>
        <ul style="margin-left: 20px; margin-top: 6px;">
          <li><strong>Slide 1:</strong> Báo Cáo Quản Trị Danh Mục Nợ 500 Khách Hàng (Dư nợ 221.4 tỷ VND)</li>
          <li><strong>Slide 2:</strong> Cơ Cấu Nợ Theo DPD (437 KH quá hạn, 92 KH nợ sâu >= 90 ngày)</li>
          <li><strong>Slide 3:</strong> Phân Khúc Ưu Tiên P1 - P4 & Ma Trận Rủi Ro</li>
          <li><strong>Slide 4:</strong> Điểm Nóng Vấn Đề: Tỷ Lệ Thiếu Ngày Cam Kết & Rủi Ro Dòng Tiền</li>
          <li><strong>Slide 5:</strong> Chiến Lược Thu Hồi Nợ 30 Ngày Tiếp Theo</li>
          <li><strong>Slide 6:</strong> Đề Xuất Trình Ban Giám Đốc Phê Duyệt Khung Cơ Cấu Hộ Kinh Doanh</li>
        </ul>
      </div>
    `;
  }
}

function renderDecisionLogs() {
  const tbody = document.getElementById('decision-log-tbody');
  if (!tbody) return;

  if (decisionLogs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">Chưa có bản ghi nào. Hãy chạy mô phỏng và lưu vào nhật ký.</td></tr>`;
    return;
  }

  tbody.innerHTML = decisionLogs.map(log => `
    <tr>
      <td><strong>${log.session}</strong></td>
      <td><span class="badge badge-tool tool-${log.tool.toLowerCase()}">${log.tool}</span></td>
      <td><span style="font-size: 0.8rem;">${log.prompt}</span></td>
      <td><span style="font-size: 0.8rem;">${log.output}</span></td>
      <td><span class="badge badge-fact" style="font-size: 0.75rem;">Verified</span></td>
      <td><span style="font-size: 0.8rem; color: var(--primary-color); font-weight: 500;">${log.decision}</span></td>
    </tr>
  `).join('');
}

/* ==========================================================================
   TAB 5: RUBRIC & DEFENSE
   ========================================================================== */
function initRubrics() {
  if (!ASSESSMENT_DATA) return;

  const container = document.getElementById('rubric-items-container');
  const totalScoreEl = document.getElementById('rubric-total-score');
  const levelBadge = document.getElementById('rubric-level-badge');

  if (container && ASSESSMENT_DATA.rubric) {
    container.innerHTML = ASSESSMENT_DATA.rubric.map(item => `
      <div class="rubric-item" data-crit-id="${item.id}" data-max="${item.maxPoints}">
        <div class="rubric-desc">
          <h4>${item.title} (Tối đa: ${item.maxPoints}đ)</h4>
          <p>${item.desc}</p>
        </div>
        <div>
          <input type="range" class="rubric-slider" min="0" max="${item.maxPoints}" value="${Math.round(item.maxPoints * 0.8)}" style="width: 100%; cursor: pointer;">
        </div>
        <div style="text-align: right;">
          <input type="number" class="rubric-num-input form-input" min="0" max="${item.maxPoints}" value="${Math.round(item.maxPoints * 0.8)}" style="width: 65px; text-align: center; padding: 4px;">
        </div>
      </div>
    `).join('');

    function updateTotalScore() {
      let total = 0;
      container.querySelectorAll('.rubric-item').forEach(row => {
        const numInput = row.querySelector('.rubric-num-input');
        total += parseInt(numInput.value || 0, 10);
      });

      totalScoreEl.textContent = `${total} / 100`;

      if (total >= 85) {
        levelBadge.className = 'badge badge-fact';
        levelBadge.textContent = 'Xuất Sắc (Thành Thạo AI)';
      } else if (total >= 70) {
        levelBadge.className = 'badge badge-p3';
        levelBadge.textContent = 'Đạt Yêu Cầu (Khá)';
      } else if (total >= 50) {
        levelBadge.className = 'badge badge-p2';
        levelBadge.textContent = 'Cần Hoàn Thiện Thêm';
      } else {
        levelBadge.className = 'badge badge-p1';
        levelBadge.textContent = 'Chưa Đạt (Lạm Dụng AI / Bị Ảo Giác)';
      }
    }

    container.querySelectorAll('.rubric-item').forEach(row => {
      const slider = row.querySelector('.rubric-slider');
      const numInput = row.querySelector('.rubric-num-input');

      slider.addEventListener('input', () => {
        numInput.value = slider.value;
        updateTotalScore();
      });

      numInput.addEventListener('input', () => {
        const max = parseInt(row.getAttribute('data-max'), 10);
        let val = parseInt(numInput.value || 0, 10);
        if (val > max) val = max;
        if (val < 0) val = 0;
        numInput.value = val;
        slider.value = val;
        updateTotalScore();
      });
    });

    updateTotalScore();
  }

  // 15 Defense Questions
  const questionsList = document.getElementById('defense-questions-list');
  if (questionsList && ASSESSMENT_DATA.defenseQuestions) {
    questionsList.innerHTML = ASSESSMENT_DATA.defenseQuestions.map((q, idx) => `
      <div class="question-item">
        <span class="question-num">${idx + 1}.</span>
        <span>${q.replace(/^\d+\.\s*/, '')}</span>
      </div>
    `).join('');
  }

  // Red Flags
  const redFlagsList = document.getElementById('red-flags-list');
  if (redFlagsList && ASSESSMENT_DATA.redFlags) {
    redFlagsList.innerHTML = ASSESSMENT_DATA.redFlags.map(rf => `
      <li style="color: #991b1b;">
        <svg viewBox="0 0 24 24" style="stroke: #b91c1c;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>
        <span>${rf}</span>
      </li>
    `).join('');
  }
}
