import HeroCard from "../components/HeroCard";

type HomeProps = {
  onGuestLogin: () => void;
  onViewCalendar: () => void;
};

function Home({ onViewCalendar }: HomeProps) {
  return (
    <div>
      <HeroCard
        onViewCalendar={onViewCalendar}
      />
    </div>
  );
}

export default Home;
