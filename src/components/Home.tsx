// Page d'accueil F1 Strategy Simulator

export default function Home({ onPlay }: { onPlay: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-red-900 text-white px-4 py-8">
      <title>F1 Strategy Simulator - Accueil</title>
      <div className="w-full max-w-2xl mx-auto text-center space-y-8 md:space-y-10">
        <img src="/assets/icons/f1-logo.svg" alt="F1 Logo" className="mx-auto w-20 md:w-28 mb-6 drop-shadow-xl" />
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-wide text-red-500 mb-2 md:mb-4">F1 Strategy Simulator</h1>
        <h2 className="text-lg md:text-2xl font-semibold text-gray-200 mb-4 md:mb-6">Plongez dans la stratégie d'une course de Formule 1 !</h2>
        <p className="text-base md:text-lg text-gray-300 mb-6 md:mb-8 leading-relaxed">
          Cette application web vous permet de simuler une course F1 complète, gérer les stratégies de chaque pilote, choisir les pneus, réagir aux incidents, et optimiser vos arrêts au stand.<br />
          <span className="text-red-400 font-bold">Objectif :</span> Terminer la course en tête grâce à la meilleure stratégie !
        </p>
        <ul className="text-left text-gray-200 bg-black/40 rounded-2xl p-6 md:p-8 mb-6 md:mb-8 shadow-2xl grid gap-4 md:gap-6">
          <li className="flex items-center gap-3 text-base md:text-lg"><span className="text-2xl">🏎️</span> <span className="font-bold">Sélectionnez un circuit</span> parmi les plus célèbres du calendrier F1</li>
          <li className="flex items-center gap-3 text-base md:text-lg"><span className="text-2xl">🧑‍💻</span> <span className="font-bold">Gérez les stratégies</span> de chaque pilote (pneus, carburant, arrêts)</li>
          <li className="flex items-center gap-3 text-base md:text-lg"><span className="text-2xl">⏱️</span> <span className="font-bold">Surveillez les écarts</span> et les performances en temps réel</li>
          <li className="flex items-center gap-3 text-base md:text-lg"><span className="text-2xl">🚨</span> <span className="font-bold">Réagissez aux incidents</span> (Safety Car, DNF...)</li>
          <li className="flex items-center gap-3 text-base md:text-lg"><span className="text-2xl">🏁</span> <span className="font-bold">Visez la victoire !</span></li>
        </ul>
        <button
          onClick={onPlay}
          className="bg-red-600 hover:bg-red-700 text-white text-lg md:text-xl font-bold py-3 md:py-4 px-10 md:px-16 rounded-full shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Jouer
        </button>
        <div className="mt-10 text-xs md:text-sm text-gray-400">
          <span>Développé par un passionné de F1 • React • 2025</span>
        </div>
      </div>
    </div>
  );
}
