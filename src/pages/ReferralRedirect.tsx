import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

/** /r/:code → /auth?mode=register&ref=CODE */
export default function ReferralRedirect() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/auth?mode=register&ref=${code ?? ""}`, { replace: true });
  }, [code, navigate]);

  return null;
}
