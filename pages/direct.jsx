import Header from"../component/header";

export default function Dynamic() {
  return (
    <div>
      <Header />
    </div>
  );
}

export async function getServerSideProps() {
	return { props: {} };
}

