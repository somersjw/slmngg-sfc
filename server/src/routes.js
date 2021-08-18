module.exports = ({ app, cors, Cache }) => {
    app.get("/redirect", async (req, res) => {
        try {
            let redirects = (await Cache.get("Redirects"))?.items;

            let subdomain = req.query.subdomain || null;
            let path = req.query.path;
            if (!path.startsWith("/")) path = "/" + path;


            if (!redirects) return res.send({ redirect: null, warn: "no redirects loaded" });

            let redirect = redirects.find(r => {
                if (!r.active) return false;
                // check subdomain & urls match
                return (r.subdomain || null) === subdomain && r.incoming_url === path;
            });

            if (!redirect) redirect = redirects.find(r => {
                if (!r.active) return false;
                // if we can't find anything on the specific subdomain, use a global one
                if (r.subdomain) return false;
                return (r.incoming_url === path);
            });

            if (!redirect) {
                return res.send({ redirect: null });
            }

            res.send({
                redirect: {
                    ...redirect,
                    // temporary move to force everything to dev
                    outgoing_url: redirect.outgoing_url.replace("slmn.gg", "dev.slmn.gg")
                }
            });
        } catch (e) {
            console.error(e);
            return res.send({ redirect: null, warn: "error occurred" });
        }
    });
};
