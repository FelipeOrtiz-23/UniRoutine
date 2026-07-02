import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Iniciar sesión | Horizonte Plus LMS"
        description="Inicia sesión en la plataforma educativa Horizonte Plus"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
