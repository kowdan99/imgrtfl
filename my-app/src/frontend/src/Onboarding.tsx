import OnboardingForm from "./OnboardingForm";

const OnboardingPage = () => {

  const handleOnboardingSubmit = async () => {
    // 👇 Post to your backend API
    // await fetch("/api/onboarding", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(),
    // });

    // 🚀 Redirect them to the gratitude dashboard
    window.location.href = "/gratitude";
  };

  return (
    <OnboardingForm
      onSubmit={handleOnboardingSubmit}
    />
  );
};

export default OnboardingPage;
