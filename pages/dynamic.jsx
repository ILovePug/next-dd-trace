import dynamic from "next/dynamic";

const Header = dynamic(() => import("../component/header"));

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

