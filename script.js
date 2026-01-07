// INTRO
const intro = document.getElementById("introScreen");
const enterBtn = document.getElementById("enterSite");

enterBtn.addEventListener("click", () => {
  intro.style.opacity = "0";
  setTimeout(() => intro.remove(), 600);
});

// ABOUT TOGGLE
const toggleBtn = document.getElementById("toggleAbout");
const moreAbout = document.getElementById("moreAbout");

toggleBtn.addEventListener("click", () => {
  moreAbout.classList.toggle("hidden");
  toggleBtn.textContent =
    moreAbout.classList.contains("hidden") ? "Read more" : "Read less";
});

// PROJECT MEDIA
document.querySelectorAll(".toggleProject").forEach(btn => {
  btn.addEventListener("click", () => {
    const media = btn.nextElementSibling;
    const isHidden = media.classList.contains("hidden");

    document.querySelectorAll(".project-media").forEach(pm => {
      pm.classList.add("hidden");
      pm.querySelectorAll("video").forEach(v => {
        v.pause();
        v.currentTime = 0;
      });
    });

    if (isHidden) {
      media.classList.remove("hidden");
      media.querySelectorAll("video").forEach(v => v.play().catch(() => {}));
      btn.textContent = "Hide Media";
    } else {
      btn.textContent = "View Media";
    }
  });
});

// PROFILE PHOTO
document.getElementById("profilePhoto")
  .addEventListener("click", e => e.target.classList.toggle("active"));

// AVATAR WAVE
const avatar = document.getElementById("avatar");
avatar.addEventListener("click", () => {
  avatar.classList.add("wave");
  setTimeout(() => avatar.classList.remove("wave"), 600);
});

// SPEECH BUBBLE AUTO SHOW
window.addEventListener("load", () => {
  const bubble = document.getElementById("avatarBubble");
  bubble.style.opacity = "1";
  setTimeout(() => bubble.style.opacity = "0", 2200);
});
