import HeroCard from "../components/HeroCard";

type HomeProps = {
  onGuestLogin: () => void;
  onCreateConcert: () => void;
};

function Home({ onCreateConcert }: HomeProps) {
  return (
    <div>
      <HeroCard onCreateConcert={onCreateConcert} />
    </div>
  );
}

export default Home;