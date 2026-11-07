// ================== PENGATURAN UNDANGAN ==================
// Ganti nomor ini dengan nomor WhatsApp penerima RSVP.
// Format internasional tanpa +, spasi, atau tanda hubung. Contoh: 6281234567890
const WHATSAPP_NUMBER = "6285721279319";

// Tanggal acara: format YYYY-MM-DDTHH:MM:SS+07:00 (WIB)
const WEDDING_DATE = new Date("2026-12-20T08:00:00+07:00");

// Nama tamu bisa dikirim lewat URL: ?to=Bapak%20Andi
const params = new URLSearchParams(window.location.search);
const guest = params.get("to");
if (guest) document.getElementById("guestName").textContent = guest;

// Buka halaman undangan
document.getElementById("openInvitation").addEventListener("click", () => {
  document.getElementById("opening").classList.add("hide");
  document.body.classList.remove("locked");
});

// Hitung mundur
function updateCountdown() {
  const diff = WEDDING_DATE.getTime() - Date.now();
  const safe = Math.max(0, diff);
  const values = {
    days: Math.floor(safe / 86400000),
    hours: Math.floor((safe % 86400000) / 3600000),
    minutes: Math.floor((safe % 3600000) / 60000),
    seconds: Math.floor((safe % 60000) / 1000)
  };
  Object.entries(values).forEach(([id, value]) => {
    document.getElementById(id).textContent = String(value).padStart(2, "0");
  });
}
updateCountdown();
setInterval(updateCountdown, 1000);

// RSVP dikirim melalui WhatsApp. Tidak disimpan ke database website.
document.getElementById("rsvpForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("name").value.trim();
  const guests = document.getElementById("guests").value;
  const attendance = document.getElementById("attendance").value;
  const message = document.getElementById("message").value.trim();

  if (!name) return;
  if (WHATSAPP_NUMBER === "6281234567890") {
    alert("Silakan ganti WHATSAPP_NUMBER di file script.js dengan nomor WhatsApp penerima RSVP terlebih dahulu.");
    return;
  }

  const text = [
    "Assalamu'alaikum, konfirmasi undangan Alya & Raka.",
    `Nama: ${name}`,
    `Kehadiran: ${attendance}`,
    `Jumlah tamu: ${guests}`,
    `Ucapan/doa: ${message || "-"}`
  ].join("\\n");

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener");
});
