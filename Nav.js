/*
   HOMI shared navigation + theme.
   On every page, inside <head>, after your page <style>:
       <link rel="stylesheet" href="theme.css">
       <script src="nav.js"></script>
   Needs Font Awesome (already on your pages).
*/

/* ---------- theme: runs immediately so the page never flashes light ---------- */
(function () {
    var root = document.documentElement;
    var script = document.currentScript;
    var base = script && script.src ? script.src.replace(/nav\.js(\?.*)?$/, "") : "";

    var file = (location.pathname.split("/").pop() || "").toLowerCase().replace(".html", "");
    if (file === "" || file === "index") file = "landingpage";
    root.setAttribute("data-page", file);

    /* storage: localStorage first, window.name as a backup.
       (Some browsers give every local file its own private storage,
        so window.name keeps the choice when you move between pages.) */
    function fromName() {
        var m = /homi-theme:(dark|light)/.exec(window.name || "");
        return m ? m[1] : null;
    }

    function toName(mode) {
        var n = (window.name || "").replace(/homi-theme:(dark|light);?/, "");
        window.name = n + "homi-theme:" + mode + ";";
    }

    function read() {
        var v = null;
        try { v = localStorage.getItem("homi-theme"); } catch (e) {}
        if (v !== "dark" && v !== "light") v = fromName();
        return v === "dark" ? "dark" : "light";
    }

    function apply(mode) {
        if (mode === "dark") root.setAttribute("data-theme", "dark");
        else root.removeAttribute("data-theme");
    }

    var mode = read();
    apply(mode);
    toName(mode);

    /* hide the page until theme.css is in, so dark mode never flashes white */
    var guard = document.createElement("style");
    guard.id = "homi-theme-guard";
    guard.textContent =
        'html[data-theme="dark"]{background:#0b1220}' +
        'html[data-theme="dark"]:not([data-theme-ready]) body{visibility:hidden}';
    document.head.appendChild(guard);

    function ready() {
        root.setAttribute("data-theme-ready", "");
    }

    /* load theme.css LAST in <head> so it always sits after the page's own styles,
       whether or not the page links it itself */
    function attachCss() {
        var link = document.querySelector('link[href*="theme.css"]');
        if (!link) {
            link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = base + "theme.css";
        }
        link.addEventListener("load", ready);
        link.addEventListener("error", ready);
        document.head.appendChild(link);   /* appending an existing link moves it to the end */
        setTimeout(ready, 1500);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", attachCss);
    else attachCss();

    /* use these from any page:  HomiTheme.toggle()  HomiTheme.set("dark")  */
    window.HomiTheme = {
        get: function () { return root.getAttribute("data-theme") === "dark" ? "dark" : "light"; },
        set: function (m) {
            m = m === "dark" ? "dark" : "light";
            apply(m);
            toName(m);
            try { localStorage.setItem("homi-theme", m); } catch (e) {}
            document.dispatchEvent(new CustomEvent("homi-theme", { detail: m }));
        },
        toggle: function () { this.set(this.get() === "dark" ? "light" : "dark"); }
    };

    /* keep other open tabs in sync */
    window.addEventListener("storage", function (e) {
        if (e.key === "homi-theme") apply(read());
    });
})();

(function () {
    var links = [
        { href: "index.html", icon: "fa-house", label: "Home", regular: false },
        { href: "Map.html", icon: "fa-map-location-dot", label: "Map", regular: false },
        { href: "Saved.html", icon: "fa-heart", label: "Saved", regular: true },
        { href: "Messages.html", icon: "fa-message", label: "Messages", regular: true },
        { href: "Profile.html", icon: "fa-user", label: "Profile", regular: true }
    ];

    var file = (location.pathname.split("/").pop() || "").toLowerCase();
    if (file === "") file = "index.html";

    var css = `        .homi-nav {
            position: fixed;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 1500;
            display: flex;
            flex-direction: column;
            gap: 6px;
            width: 66px;
            padding: 10px 9px;
            background: rgba(255,255,255,.94);
            backdrop-filter: blur(14px);
            border: 1px solid #e3e8ef;
            border-radius: 22px;
            box-shadow: 0 15px 45px rgba(24,39,75,.12);
        }

        .homi-nav-item {
            position: relative;
            width: 48px;
            height: 48px;
            border-radius: 15px;
            display: grid;
            place-items: center;
            color: #6b7280;
            font-size: 17px;
            text-decoration: none;
            transition: .2s ease;
        }

        .homi-nav-item:hover,
        .homi-nav-item.active {
            background: #eef6ff;
            color: #0875e1;
        }

        .homi-nav-item.active::before {
            content: "";
            position: absolute;
            left: -9px;
            top: 14px;
            width: 4px;
            height: 20px;
            border-radius: 0 4px 4px 0;
            background: #0875e1;
        }

        .homi-nav-item::after {
            content: attr(data-label);
            position: absolute;
            left: calc(100% + 16px);
            top: 50%;
            transform: translate(-6px,-50%);
            padding: 7px 12px;
            border-radius: 8px;
            background: #14214f;
            color: #fff;
            font: 600 12px/1 system-ui,sans-serif;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: .2s ease;
        }

        .homi-nav-item:hover::after,
        .homi-nav-item:focus-visible::after {
            opacity: 1;
            transform: translate(0,-50%);
        }

        .homi-nav-item:focus-visible {
            outline: 3px solid rgba(8,117,225,.45);
        }

        #menuButton,
        #sideMenu,
        #sidebarOverlay {
            display: none!important;
        }

        @media(max-width:900px) {
            .homi-nav {
                left: 50%;
                top: auto;
                bottom: calc(14px + env(safe-area-inset-bottom,0px));
                transform: translateX(-50%);
                flex-direction: row;
                width: auto;
                padding: 8px;
                gap: 4px;
            }
            .homi-nav-item {
                width: 46px;
                height: 46px;
            }
            .homi-nav-item.active::before {
                left: 13px;
                top: auto;
                bottom: -8px;
                width: 20px;
                height: 4px;
                border-radius: 4px 4px 0 0;
            }
            .homi-nav-item::after {
                display: none;
            }
            body {
                padding-bottom: 96px;
            }
            .floating-message {
                bottom: calc(92px + env(safe-area-inset-bottom,0px))!important;
            }
        }

    `;

    function build() {
        var style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);

        var nav = document.createElement("nav");
        nav.className = "homi-nav";
        nav.setAttribute("aria-label", "Main navigation");

        nav.innerHTML = links.map(function (l) {
            var active = l.href.toLowerCase() === file;
            var style = l.regular && !active ? "fa-regular" : "fa-solid";
            return '<a class="homi-nav-item' + (active ? " active" : "") + '" href="' + l.href + '"' +
                   ' data-label="' + l.label + '" aria-label="' + l.label + '"' +
                   (active ? ' aria-current="page"' : "") + '>' +
                   '<i class="' + style + " " + l.icon + '"></i></a>';
        }).join("");

        document.body.appendChild(nav);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
    else build();
})();