import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
}

const SEO = ({ title, description, canonical, image }: SEOProps) => {
  const fullTitle = `${title} | Employee Travel Expense Tracker`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />} 
      {image && <meta property="og:image" content={image} />}
    </Helmet>
  );
};

export default SEO;
