/* ABOUT TOGGLE */
const toggleBtn = document.getElementById("toggleAbout");
const moreAbout = document.getElementById("moreAbout");

toggleBtn.addEventListener("click", () => {
  moreAbout.classList.toggle("hidden");
  toggleBtn.textContent =
    moreAbout.classList.contains("hidden") ? "Read more" : "Read less";
});

/* PROJECT MEDIA */
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

/* PROFILE PHOTO */
document.getElementById("profilePhoto")
  .addEventListener("click", e => e.target.classList.toggle("active"));

/* AVATAR WAVE */
document.getElementById("avatar")
  .addEventListener("click", e => {
    e.target.classList.add("wave");
    setTimeout(() => e.target.classList.remove("wave"), 600);
  });
