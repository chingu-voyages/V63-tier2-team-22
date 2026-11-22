import HeroCard from "../components/HeroCard";

type HomeProps = {
  onGuestLogin: () => void;
  onCreateConcert: () => void;
  onViewCalendar: () => void;
};

function Home({ onCreateConcert, onViewCalendar }: HomeProps) {
  return (
    <div>
      <HeroCard
        onCreateConcert={onCreateConcert}
        onViewCalendar={onViewCalendar}
      />
    </div>
  );
}

export default Home;
