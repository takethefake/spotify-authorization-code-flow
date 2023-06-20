import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";

export const SpotifyCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getCodeAndExchange = async () => {
      const code = searchParams.get("code");
      console.log(code);

      /**
       * is called twice in dev mode because of strict mode but in production it is called only once
       * @see https://www.techiediaries.com/react-18-useeffect/
       */

      const response = await fetch(`/api/callback?code=${code}`);
      const data = await response.json();
      console.log(data);

      navigate("/");

      // Handle the response data and perform any necessary actions
    };

    getCodeAndExchange();
  }, [navigate, searchParams]);

  return null;
};
