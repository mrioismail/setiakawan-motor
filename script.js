let storageData = [];
let editingId = null;
const mapping = {
  1: "H",
  2: "D",
  3: "T",
  4: "N",
  5: "L",
  6: "G",
  7: "J",
  8: "R",
  9: "S",
  0: "X",
};

function generateSmartCode(harga, periode, singkatan) {
  // REVISI: Harga Satuan x 2 untuk Kode Harga
  let hargaDikaliDua = Number(harga) * 2;
  let fmt = hargaDikaliDua.toLocaleString("id-ID");

  let encoded = "";
  for (let char of fmt) {
    encoded += mapping[char] ? mapping[char] : char;
  }

  let d = new Date(periode);
  let m = String(d.getMonth() + 1).padStart(2, "0");
  let yShort = d.getFullYear().toString().slice(-2);

  return `${encoded} ${m}/${yShort} ${singkatan.toUpperCase()}`;
}

function tambahBarang() {
  const p = document.getElementById("periode").value;
  const s = document.getElementById("supplier").value;
  const sn = document.getElementById("singkatan").value;
  const nb = document.getElementById("namaBarang").value;
  const jb = document.getElementById("jenisBarang").value;
  const h = document.getElementById("harga").value;
  const q = document.getElementById("qty").value;

  if (!p || !nb || !h || !q) {
    alert("Halo! Mohon lengkapi data barangnya dulu ya.");
    return;
  }

  const kode = generateSmartCode(h, p, sn);

  if (editingId !== null) {
    // Mode update: timpa data barang yang sedang diedit
    const idx = storageData.findIndex((item) => item.id === editingId);
    if (idx !== -1) {
      storageData[idx] = {
        ...storageData[idx],
        periode: p,
        supplier: s,
        singkatan: sn,
        nama: nb,
        jenis: jb,
        harga: h,
        hargaKaliDua: Number(h) * 2,
        qty: parseInt(q),
        kode: kode,
      };
    }
    batalEdit(false);
  } else {
    // Mode tambah baru
    const item = {
      id: Date.now(),
      periode: p,
      supplier: s,
      singkatan: sn,
      nama: nb,
      jenis: jb,
      harga: h,
      hargaKaliDua: Number(h) * 2, // Tambahan properti untuk tampilan
      qty: parseInt(q),
      kode: kode,
    };
    storageData.push(item);
  }

  renderList();
  ["namaBarang", "jenisBarang", "harga", "qty"].forEach(
    (id) => (document.getElementById(id).value = ""),
  );
}

function hapusItem(id) {
  storageData = storageData.filter((item) => item.id !== id);
  if (editingId === id) batalEdit();
  renderList();
}

function editItem(id) {
  const item = storageData.find((it) => it.id === id);
  if (!item) return;

  document.getElementById("periode").value = item.periode;
  document.getElementById("supplier").value = item.supplier;
  document.getElementById("singkatan").value = item.singkatan;
  document.getElementById("namaBarang").value = item.nama;
  document.getElementById("jenisBarang").value = item.jenis;
  document.getElementById("harga").value = item.harga;
  document.getElementById("qty").value = item.qty;

  editingId = id;

  const btnSimpan = document.getElementById("btnSimpanBarang");
  btnSimpan.textContent = "Update Barang";
  btnSimpan.classList.add("btn-editing");
  document.getElementById("cancelEditBtn").style.display = "flex";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function batalEdit(clearForm = true) {
  editingId = null;

  const btnSimpan = document.getElementById("btnSimpanBarang");
  btnSimpan.textContent = "Simpan ke Daftar Barang";
  btnSimpan.classList.remove("btn-editing");
  document.getElementById("cancelEditBtn").style.display = "none";

  if (clearForm) {
    ["namaBarang", "jenisBarang", "harga", "qty"].forEach(
      (id) => (document.getElementById(id).value = ""),
    );
  }
}

function renderList() {
  const container = document.getElementById("dataListContainer");
  const empty = document.getElementById("emptyState");

  if (storageData.length === 0) {
    container.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";
  container.innerHTML = storageData
    .map(
      (item) => `
               <div class="data-item animate-in">
                   <div style="width: 100%;">
                       <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                          <h4 style="font-size: 16px; margin: 0; color: var(--primary-dark); font-weight: 700;">${item.nama}</h4>
                          <div style="display: flex; gap: 6px;">
                             <button class="btn-edit-outline" onclick="editItem(${item.id})" style="padding: 4px 8px;">Edit</button>
                             <button class="btn-danger-outline" onclick="hapusItem(${item.id})" style="padding: 4px 8px;">Hapus</button>
                          </div>
                       </div>
                       
                       <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; font-size: 13px;">
                          <div style="display: flex; flex-direction: column;">
                              <span style="font-size: 11px; font-weight: 600; color: var(--text-light); text-transform: uppercase;">Kategori</span>
                              <span style="color: var(--text-dark); font-weight: 500;">${item.jenis || "-"}</span>
                          </div>
                          <div style="display: flex; flex-direction: column;">
                              <span style="font-size: 11px; font-weight: 600; color: var(--text-light); text-transform: uppercase;">Harga Satuan</span>
                              <span style="color: var(--text-dark); font-weight: 500;">Rp ${Number(item.harga).toLocaleString("id-ID")}</span>
                          </div>
                          <div style="display: flex; flex-direction: column;">
                              <span style="font-size: 11px; font-weight: 600; color: var(--text-light); text-transform: uppercase;">Jumlah</span>
                              <span style="color: var(--text-dark); font-weight: 500;">${item.qty} Pcs</span>
                          </div>
                          <div style="display: flex; flex-direction: column;">
                              <span style="font-size: 11px; font-weight: 600; color: var(--text-light); text-transform: uppercase;">Total Bayar</span>
                              <span style="color: var(--success); font-weight: 700;">Rp ${(item.harga * item.qty).toLocaleString("id-ID")}</span>
                          </div>
                       </div>

                       <div style="margin-top: 15px; padding: 12px; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
                          
                          <div>
                             <span style="font-size: 10px; font-weight: 700; color: var(--text-light); text-transform: uppercase; display: block; margin-bottom: 4px;">Kode Harga Otomatis</span>
                             <div class="kode-tag" style="width: 100%; text-align: center; box-sizing: border-box; display: block;">
                                 ${item.kode}
                             </div>
                          </div>
                       </div>
                   </div>
               </div>`,
    )
    .join("");
}

function buatCanvasBarcode(kode) {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, kode, {
    format: "CODE128",
    displayValue: false,
    margin: 4,
    height: 40,
    width: 1.6,
  });
  return canvas.toDataURL("image/png").split(",")[1]; // base64 tanpa prefix
}

async function exportExcel() {
  if (storageData.length === 0) {
    alert("Daftar masih kosong, silakan isi data terlebih dahulu.");
    return;
  }

  const btnExport = document.querySelector(".btn-export");
  const teksAsli = btnExport.textContent;
  btnExport.disabled = true;
  btnExport.textContent = "Membuat Barcode...";

  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Data_Export");

    sheet.columns = [
      { header: "Bulan/Tahun", key: "periode", width: 14 },
      { header: "Supplier", key: "supplier", width: 22 },
      { header: "Nama Barang", key: "nama", width: 22 },
      { header: "Kategori", key: "jenis", width: 16 },
      { header: "Harga Satuan", key: "harga", width: 16 },
      { header: "Harga x 2", key: "hargaKaliDua", width: 16 },
      { header: "Kode Harga", key: "kode", width: 20 },
      { header: "Barcode", key: "barcode", width: 26 },
    ];
    sheet.getRow(1).font = { bold: true };

    // Satu kode yang sama cukup di-generate sekali gambarnya, lalu dipakai ulang
    const cacheGambarBarcode = {};
    function ambilIdGambarBarcode(kode) {
      if (cacheGambarBarcode[kode]) return cacheGambarBarcode[kode];
      const base64 = buatCanvasBarcode(kode);
      const imageId = workbook.addImage({ base64, extension: "png" });
      cacheGambarBarcode[kode] = imageId;
      return imageId;
    }

    let rowIndex = 1; // baris 1 = header
    storageData.forEach((item) => {
      let d = new Date(item.periode);
      let pStr = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      const imageId = ambilIdGambarBarcode(item.kode);

      for (let i = 0; i < item.qty; i++) {
        rowIndex++;
        sheet.addRow({
          periode: pStr,
          supplier: item.supplier,
          nama: item.nama,
          jenis: item.jenis,
          harga: Number(item.harga),
          hargaKaliDua: item.hargaKaliDua,
          kode: item.kode,
        });
        sheet.getRow(rowIndex).height = 32;

        sheet.addImage(imageId, {
          tl: { col: 7, row: rowIndex - 1 },
          ext: { width: 140, height: 40 },
        });
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const supplierName = (storageData[0].supplier || "Umum")
      .replace(/\s+/g, "_")
      .toLowerCase();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${supplierName}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Gagal membuat file Excel dengan barcode. Silakan coba lagi.");
  } finally {
    btnExport.disabled = false;
    btnExport.textContent = teksAsli;
  }
}

window.onload = function () {
  const rionelSelect = document.getElementById("periode");
  const now = new Date();
  const bulanSekarang = String(now.getMonth() + 1).padStart(2, "0");
  rionelSelect.value = `2026-${bulanSekarang}`;
};
