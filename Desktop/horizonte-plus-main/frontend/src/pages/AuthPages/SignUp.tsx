import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Crear cuenta | Horizonte Plus LMS"
        description="Regístrate en la plataforma educativa Horizonte Plus"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
