import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import NotFound from "./NotFound";
import ArticleContent from "../components/ArticleContent";

export default function Article() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setStatus("loading");
    window.scrollTo(0, 0);
    api
      .getArticleBySlug(slug)
      .then(async (data) => {
        setArticle(data);
        setStatus("ok");
        if (data.related?.length) {
          const all = await api.getArticles();
          setRelated(all.filter((a) => data.related.includes(a.slug)).slice(0, 3));
        }
      })
      .catch(() => setStatus("notfound"));
  }, [slug]);

  if (status === "loading") {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <div className="lr-spinner" />
      </div>
    );
  }
  if (status === "notfound" || !article) return <NotFound />;

  return (
    <div className="container py-5 fade-in-up">
      <ArticleContent article={article} related={related} showAds linkable />
    </div>
  );
}
