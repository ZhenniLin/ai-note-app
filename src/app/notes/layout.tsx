import Navbar from "./_components/Navbar";

/* eslint-disable @typescript-eslint/no-unused-vars */
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <main className="p-4 max-w-7xl m-auto">{children}</main>
    </>
  );
};

export default Layout;
