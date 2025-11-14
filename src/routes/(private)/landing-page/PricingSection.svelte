<script>
  import { onMount } from "svelte";
  import PricingCard from "./PricingCard.svelte";
  import EventPackCard from "./EventPackCard.svelte";
  import FilterBenefits from "./FilterBenefits.svelte";
  import { getPricePlans } from "../../../services/actions/price-plans.js";
  
  let showPlans = true;
  let subscriptionPlans = [];
  let loading = true;

  const toggleView = () => {
    showPlans = !showPlans;
  };

  onMount(async () => {
    try {
      const response = await getPricePlans({ sort: "monthly_price" });
      if (!response.err && response.result) {
        subscriptionPlans = response.result.map(plan => ({
          name: plan.name,
          description: plan.description || "",
          monthlyPrice: plan.monthly_price ? parseInt(plan.monthly_price) : null,
          annualPrice: plan.yearly_price ? parseInt(plan.yearly_price) : null,
          features: plan.features ? plan.features.split('\n').filter(f => f.trim()) : [],
          cta: `Choose ${plan.name}`,
          popular: plan.name.toLowerCase().includes('pro')
        }));
      }
    } catch (error) {
      console.error('Failed to load pricing plans:', error);
    } finally {
      loading = false;
    }
  });

  const eventPacks = [
    {
      name: "Basic Pack",
      description: "1 Static Filter",
      price: 9999,
      cta: "Get This Pack",
    },
    {
      name: "Animated Filter",
      description: "1 Animated Filter",
      price: 14999,
      cta: "Get This Pack",
    },
    {
      name: "AI Animated Filter",
      description: "1 AI powered Animated Filter",
      price: 24999,
      cta: "Get This Pack",
    },
    {
      name: "Premium Pack",
      description: "Up to 3 Animated AI Filters",
      price: 44999,
      cta: "Get This Pack",
    },
  ];
</script>

<section class="pricing-section">
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h2>
        Choose Your <span class="gradient-text">AR Journey</span>
      </h2>
      <p>
        Select the perfect plan that grows with your AR needs and creativity
      </p>

      <!-- Plans/Packs Toggle -->
      <div class="toggle-container">
        <div class="main-toggle">
          <span class:active={showPlans} on:click={() => showPlans = true}>Plans</span>
          <span class:active={!showPlans} on:click={() => showPlans = false}>Packs</span>
        </div>
      </div>
    </div>

    {#if showPlans}
      <!-- Subscription Plans -->
      <div class="plans">
        {#if loading}
          <div class="loading">Loading plans...</div>
        {:else}
          {#each subscriptionPlans as plan, index}
            <PricingCard {...plan} delay={index * 100} />
          {/each}
        {/if}
      </div>
    {:else}
      <!-- Event Packs -->
      <div class="event-packs">
        <div class="event-header">
          <h3>One-Time Event Packs</h3>
          <p>Perfect for weddings, festivals & product launches</p>
        </div>

        <div class="packs">
          {#each eventPacks as pack, index}
            <EventPackCard {...pack} delay={index * 100} />
          {/each}
        </div>
      </div>
    {/if}

    <!-- Filter Benefits -->
    <FilterBenefits />
  </div>
</section>

<style>
  .pricing-section {
    padding: 4rem 1rem;
    background: var(--background, #fafafa);
  }
  
  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  
  .header {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  .header h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    line-height: 1.2;
  }
  
  .header p {
    font-size: 1.125rem;
    color: #666;
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
  }
  
  .gradient-text {
    background: linear-gradient(90deg, #6366f1, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .toggle-container {
    display: flex;
    justify-content: center;
    margin-bottom: 3rem;
  }
  
  .main-toggle {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 50px;
    padding: 6px;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
  }
  
  .main-toggle::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1));
    border-radius: 50px;
    z-index: 0;
  }
  
  .main-toggle span {
    font-size: 1rem;
    font-weight: 600;
    padding: 12px 24px;
    border-radius: 40px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
    z-index: 1;
    min-width: 80px;
    text-align: center;
  }
  
  .main-toggle span.active {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
    transform: translateY(-2px);
  }
  
  .main-toggle span:hover:not(.active) {
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
    transform: translateY(-1px);
  }
  
  .save-badge {
    background: linear-gradient(90deg, #6366f1, #ec4899);
    color: white;
    padding: 0.4rem 1rem;
    border-radius: 9999px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  
  .plans {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-bottom: 5rem;
  }
  
  @media (min-width: 768px) {
    .plans {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .plans {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  .event-packs {
    margin-bottom: 5rem;
  }
  
  .event-header {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  .event-header h3 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
    line-height: 1.2;
  }
  
  .event-header p {
    font-size: 1.125rem;
    color: #666;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
  }
  
  .packs {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  @media (min-width: 640px) {
    .packs {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .packs {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .pricing-section {
      padding: 3rem 1rem;
    }
    
    .header h2 {
      font-size: 2rem;
    }
    
    .header p {
      font-size: 1rem;
    }
    
    .toggle span {
      font-size: 0.9rem;
    }
    
    .event-header h3 {
      font-size: 1.75rem;
    }
    
    .event-header p {
      font-size: 1rem;
    }
  }
  
  .loading {
    grid-column: 1 / -1;
    text-align: center;
    padding: 2rem;
    color: #666;
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    .header h2 {
      font-size: 1.75rem;
    }
    
    .main-toggle span {
      font-size: 0.9rem;
      padding: 10px 20px;
      min-width: 70px;
    }
    
    .save-badge {
      font-size: 0.8rem;
      padding: 0.3rem 0.8rem;
    }
  }
</style>