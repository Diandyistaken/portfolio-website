/* =========================================================================
 * DOKUNMATİK KONTROLLER — mobil/tablet için sanal joystick + eylem tuşları.
 * Sol: analog joystick (yürüme; uçuşta dikey eksen). Sağ: F (uç) ve E
 * (gir/konuş). Engine.setAxis ile motoru besler; klavye masaüstünde çalışır.
 * pointer:coarse (veya dar ekran) algılanınca otomatik görünür.
 * ========================================================================= */
(function () {
  let wrap, stick, knob, active = false;
  const drag = { id: null, cx: 0, cy: 0, R: 46 };

  function isTouch() {
    return window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 820 || "ontouchstart" in window;
  }

  function init() {
    if (!isTouch()) return;
    active = true;
    wrap = document.createElement("div");
    wrap.id = "touch-ui";
    wrap.innerHTML = `
      <div class="tc-stick" aria-hidden="true"><div class="tc-base"></div><div class="tc-knob"></div></div>
      <div class="tc-actions">
        <button class="tc-btn tc-fly" aria-label="Uç">✈</button>
        <button class="tc-btn tc-act" aria-label="Gir / Konuş">E</button>
      </div>`;
    document.body.appendChild(wrap);
    stick = wrap.querySelector(".tc-stick");
    knob = wrap.querySelector(".tc-knob");
    bindStick();
    bindButtons();
    document.body.classList.add("is-touch");
  }

  function bindStick() {
    const setKnob = (dx, dy) => { knob.style.transform = `translate(${dx}px, ${dy}px)`; };
    stick.addEventListener("pointerdown", (e) => {
      e.preventDefault(); e.stopPropagation();
      const r = stick.getBoundingClientRect();
      drag.id = e.pointerId; drag.cx = r.left + r.width / 2; drag.cy = r.top + r.height / 2;
      stick.setPointerCapture(e.pointerId);
      window.Sound && Sound.unlock && Sound.unlock();
    });
    stick.addEventListener("pointermove", (e) => {
      if (drag.id !== e.pointerId) return;
      let dx = e.clientX - drag.cx, dy = e.clientY - drag.cy;
      const len = Math.hypot(dx, dy) || 1;
      const cl = Math.min(len, drag.R);
      dx = (dx / len) * cl; dy = (dy / len) * cl;
      setKnob(dx, dy);
      const nx = dx / drag.R, ny = dy / drag.R;
      // yatay = yürüme; dikey = uçuşta yüksel/alçal (yukarı ekranda -, motorda +z)
      Engine.setAxis(Math.abs(nx) > 0.18 ? nx : 0, Math.abs(ny) > 0.25 ? -ny : 0);
    });
    const end = (e) => {
      if (drag.id !== e.pointerId) return;
      drag.id = null; setKnob(0, 0); Engine.setAxis(0, 0);
    };
    stick.addEventListener("pointerup", end);
    stick.addEventListener("pointercancel", end);
  }

  function bindButtons() {
    const fly = wrap.querySelector(".tc-fly"), act = wrap.querySelector(".tc-act");
    const press = (btn, key) => {
      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault(); e.stopPropagation();
        btn.classList.add("down");
        window.dispatchEvent(new KeyboardEvent("keydown", { key }));
      });
      const up = (e) => { e.preventDefault(); btn.classList.remove("down");
        window.dispatchEvent(new KeyboardEvent("keyup", { key })); };
      btn.addEventListener("pointerup", up);
      btn.addEventListener("pointercancel", up);
    };
    press(fly, "f");
    press(act, "e");
  }

  window.TouchControls = { init, isTouch };
})();
