import { Helmet } from "react-helmet-async";

/**
 * SEO component for per-page meta tags (#24)
 */
function SEO({ title, description, path = "" }) {
  const siteName = "ECHONA - AI Mental Wellness";
  const baseUrl = "https://echona-qanj.vercel.app";
  const fullTitle = title ? `${title} | ECHONA` : siteName;
  const desc = description || "AI-powered mental wellness platform using emotion detection and music therapy for emotional regulation and well-being.";
  const url = `${baseUrl}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="ECHONA" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  );
}

export default SEO;
