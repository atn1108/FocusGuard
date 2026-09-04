var FocusGuardSites = (function () {

    const registry = [
        { key: "youtube", host: "youtube.com", mode: "path-prefix", paths: ["/shorts"], label: "YouTube Shorts", brand: "yt", icon: "youtube" },
        { key: "tiktok", host: "tiktok.com", mode: "all", label: "TikTok", brand: "tt", icon: "tiktok" },
        { key: "instagram", host: "instagram.com", mode: "all", label: "Instagram", brand: "ig", icon: "instagram" },
        { key: "facebook", host: "facebook.com", mode: "all", label: "Facebook", brand: "fb", icon: "facebook" },
        { key: "reddit", host: "reddit.com", mode: "all", label: "Reddit", brand: "rd", icon: "reddit" },
        { key: "x", host: "x.com", aliases: ["twitter.com"], mode: "all", label: "X / Twitter", brand: "x", icon: "x" },
        { key: "twitch", host: "twitch.tv", mode: "all", label: "Twitch", brand: "tw", icon: "twitch" },
        { key: "pinterest", host: "pinterest.com", mode: "all", label: "Pinterest", brand: "pt", icon: "pinterest" },
        { key: "netflix", host: "netflix.com", mode: "all", label: "Netflix", brand: "nf", icon: "netflix" }
    ];

    const DEFAULT_BUDGET_MINUTES = 30;

    function normalizeHost(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//, "")
            .replace(/\/.*$/, "")
            .replace(/^www\./, "");
    }

    function hostMatches(siteHost, actualHost) {
        if (!siteHost || !actualHost) return false;
        const h = String(actualHost).toLowerCase();
        const s = String(siteHost).toLowerCase();
        if (h === s) return true;
        if (h.endsWith("." + s)) return true;
        return false;
    }

    function hostsFor(site) {
        const list = [site.host];
        if (site.aliases) list.push(...site.aliases);
        return list;
    }

    function urlFrom(value) {
        try {
            return new URL(value);
        } catch (e) {
            return null;
        }
    }

    function blockableUrl(site, value) {
        if (!site) return false;
        if (site.mode === "all") return true;
        const url = urlFrom(value);
        if (!url) return false;
        if (site.paths && site.paths.length) {
            return site.paths.some(p => url.pathname.startsWith(p));
        }
        return true;
    }

    return {

        DEFAULT_BUDGET_MINUTES: DEFAULT_BUDGET_MINUTES,

        registry: registry,

        keys() {
            return registry.map(s => s.key);
        },

        labelFor(key) {
            const site = this.siteFor(key);
            return site ? site.label : key;
        },

        siteFor(key) {
            return registry.find(s => s.key === key) || null;
        },

        customKey(host) {
            return "custom:" + normalizeHost(host);
        },

        // Resolve a URL against the built-in registry plus user-added hosts.
        resolve(value, customHosts) {
            const url = urlFrom(value);
            if (!url) return null;
            const hn = url.hostname.toLowerCase();

            for (const site of registry) {
                if (hostsFor(site).some(h => hostMatches(h, hn))) {
                    return { key: site.key, host: site.host, label: site.label, mode: site.mode, paths: site.paths, builtin: true };
                }
            }

            const customs = Array.isArray(customHosts) ? customHosts : [];
            for (const c of customs) {
                const ch = normalizeHost(c.host);
                if (hostMatches(ch, hn)) {
                    return { key: c.key || this.customKey(ch), host: ch, label: c.label || ch, mode: "all", builtin: false };
                }
            }

            return null;
        },

        // Should this URL be guarded (i.e. is it a match for that site)?
        isGuarded(value, customHosts) {
            const site = this.resolve(value, customHosts);
            return site ? blockableUrl(site, value) : false;
        },

        // Map an internal key back to a host string (for dynamic registration cleanup).
        hostForKey(key) {
            if (key && key.indexOf("custom:") === 0) {
                return key.slice("custom:".length);
            }
            const site = this.siteFor(key);
            return site ? site.host : null;
        }
    };
})();