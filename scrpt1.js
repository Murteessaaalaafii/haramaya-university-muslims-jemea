(function(){
  'use strict';
  const form = document.getElementById('reg-form');
  const errorsEl = document.getElementById('form-errors');
  const successEl = document.getElementById('form-success');
  const listBody = document.getElementById('list-body');
  const refreshBtn = document.getElementById('refresh');
  const listSection = document.getElementById('list-section');
  const showListBtn = document.getElementById('show-list');
  const toggleListBtn = document.getElementById('toggle-list');
  const searchInput = document.getElementById('search');
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  let allItems = [];

  async function fetchJSON(url, opts) {
    const res = await fetch(url, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts));
    if (!res.ok) {
      let msg = 'Request failed';
      try { const data = await res.json(); if (data.errors) msg = data.errors.join(', '); } catch {}
      throw new Error(msg);
    }
    return res.json();
  }

  function getFormData(form) {
    const data = new FormData(form);
    return Object.fromEntries(data.entries());
  }

  function renderRows(items){
    if (!items || !items.length) {
      listBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No records yet.</td></tr>';
      return;
    }
    const rows = items.map(r => `
      <tr>
        <td>${escapeHtml(r.fullName || '')}</td>
        <td>${escapeHtml(r.studentId || '')}</td>
        <td>${escapeHtml(r.department || '')}</td>
        <td>${escapeHtml(r.year || '')}</td>
        <td>${escapeHtml(r.gender || '')}</td>
        <td>${escapeHtml(r.email || '')}</td>
        <td>${escapeHtml(r.phone || '')}</td>
        <td>${escapeHtml(r.membershipType || '')}</td>
        <td>${r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</td>
      </tr>`).join('');
    listBody.innerHTML = rows;
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"]+/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  async function loadList(){
    try{
      allItems = await fetchJSON('/api/registrations');
      applyFilter();
    }catch(e){
      errorsEl.textContent = e.message || 'Failed to load list';
    }
  }

  function applyFilter(){
    const q = (searchInput && searchInput.value || '').toLowerCase();
    if (!q) return renderRows(allItems);
    const filtered = allItems.filter(r => [
      r.fullName, r.studentId, r.department, r.email, r.phone, r.membershipType, r.gender, r.year
    ].some(v => String(v || '').toLowerCase().includes(q)));
    renderRows(filtered);
  }

  function clientValidate(v){
    const errs = [];
    function req(name, label){ if(!v[name] || String(v[name]).trim()==='') errs.push(`${label} is required`); }
    req('fullName','Full Name');
    req('studentId','Student ID');
    req('department','Department');
    req('year','Year');
    req('gender','Gender');

    if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errs.push('Email invalid');
    if (v.phone && !/^\+?[0-9\-\s]{7,15}$/.test(v.phone)) errs.push('Phone invalid');
    return errs;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorsEl.textContent = '';
    successEl.textContent = '';
    const payload = getFormData(form);
    const errs = clientValidate(payload);
    if (errs.length){
      errorsEl.textContent = errs.join(', ');
      return;
    }
    try{
      const created = await fetchJSON('/api/register', { method: 'POST', body: JSON.stringify(payload) });
      successEl.textContent = 'Registration successful';
      form.reset();
      loadList();
    }catch(err){
      errorsEl.textContent = err.message || 'Registration failed';
    }
  });

  refreshBtn.addEventListener('click', loadList);
  if (searchInput) searchInput.addEventListener('input', applyFilter);

  if (showListBtn) showListBtn.addEventListener('click', () => {
    if (listSection) listSection.classList.remove('hidden');
    if (toggleListBtn) toggleListBtn.textContent = 'Hide';
    loadList();
  });

  if (toggleListBtn) toggleListBtn.addEventListener('click', () => {
    if (!listSection) return;
    const hidden = listSection.classList.toggle('hidden');
    toggleListBtn.textContent = hidden ? 'Show' : 'Hide';
  });

  // initial load
  // keep hidden by default; load on demand when user clicks Show List
})();